/**
 * WordPress dependencies.
 */
import { __, sprintf } from "@wordpress/i18n";

import { parse } from "@wordpress/blocks";

import { Modal } from "@wordpress/components";

import { useDebounce } from "@wordpress/compose";

import { dispatch, select, useDispatch, useSelect } from "@wordpress/data";

import { useCallback, useEffect, useMemo, useState } from "@wordpress/element";

import { close, Icon, search } from "@wordpress/icons";

/**
 * Internal dependencies.
 */
import { insertBlockBelow } from "../../helpers/block-utility";
import { otterMascot } from "../../helpers/icons";
import Sidebar from "./sidebar";
import Topbar, { SmartTagRow, TopbarSkeleton, TagRowSkeleton } from "./topbar";
import Template, { UPSELL_BLOCK } from "./template";
import Preview from "./preview";
import CloudLibraryPlaceholder from "./cloudLibraryPlaceholder";
import EnableAtomicWind from "./enableAtomicWind";

import {
  createSearchIndex,
  fuzzyMatches,
  matchToken,
  parseQuery,
  similar,
  suggestTags,
} from "./smart";

import { accentContent } from "./accent";

const CLOUD_EMPTY_CATEGORY = "cloud-empty";

// Section categories bucketed into meaningful sidebar groups. Mirrors the
// taxonomy registered in inc/class-patterns.php. Groups only render the
// categories that at least one pattern actually uses, so empty (future)
// categories listed here stay hidden until patterns adopt them.
const SECTION_GROUPS = [
  {
    id: "structure",
    label: __("Layout & Structure", "otter-blocks"),
    categories: ["header", "page-sections"],
  },
  {
    id: "content",
    label: __("Content", "otter-blocks"),
    categories: [
      "features",
      "gallery",
      "team",
      "text",
      "blog",
      "faq",
      "timeline",
      "portfolio",
    ],
  },
  {
    id: "convert",
    label: __("Conversion", "otter-blocks"),
    categories: [
      "call-to-action",
      "forms",
      "pricing",
      "contact",
      "newsletter",
      "waitlist",
    ],
  },
  {
    id: "proof",
    label: __("Social Proof", "otter-blocks"),
    categories: [
      "testimonials",
      "stats",
      "case-studies",
      "clients",
    ],
  },
  {
    id: "media",
    label: __("Media", "otter-blocks"),
    categories: ["video", "maps", "icons"],
  },
];

// Categories that are containers, not browsable destinations.
const HIDDEN_CATEGORIES = ["otter-blocks", "featured", "pages"];

// Refine facets where each pattern has exactly one value, so selecting a tag
// replaces any other active tag in the same group instead of ANDing with it.
// Tone and layout are single-value by nature; among curated metadata only
// `style` is exclusive (a pattern has one style, but can serve many use cases).
const EXCLUSIVE_META_GROUPS = ["style"];

// The exclusivity bucket a tag belongs to, or null when it stacks freely.
const exclusiveBucket = (tag) => {
  if ("tone" === tag.kind || "layout" === tag.kind || "access" === tag.kind) {
    return tag.kind;
  }

  if ("meta" === tag.kind && EXCLUSIVE_META_GROUPS.includes(tag.group)) {
    return "meta:" + tag.group;
  }

  return null;
};

const isPackCategory = (name) => name.endsWith("-pack");

const isCloudCategory = (name) => name.startsWith("ti-tc-");

const isPagePattern = (pattern) =>
  pattern.categories.some(
    (category) => isPackCategory(category) || "pages" === category,
  );

// Block types that aren't registered at all (e.g. a disabled block module)
// parse into core/missing wrappers — collect their original names.
const findMissingBlocks = (blocks) =>
  blocks.flatMap((block) => [
    ...("core/missing" === block.name && block.attributes?.originalName
      ? [block.attributes.originalName]
      : []),
    ...findMissingBlocks(block.innerBlocks || []),
  ]);

const Library = ({ onClose }) => {
  const { insertBlocks } = useDispatch("core/block-editor");
  const { createSuccessNotice, createWarningNotice } =
    useDispatch("core/notices");
  const { set } = useDispatch("core/preferences");

  const { clientID, favorites, columns, accent } = useSelect((select) => {
    const { getSelectedBlockClientId } = select("core/block-editor");
    const { get } = select("core/preferences");

    return {
      clientID: getSelectedBlockClientId(),
      favorites: get("themeisle/otter-blocks", "patterns-favorites") || [],
      // Clamp to the menu's range: 5 columns used to be offered, so the
      // stored preference may exceed the current maximum.
      columns: Math.min(get("themeisle/otter-blocks", "patterns-columns") || 3, 4),
      accent: get("themeisle/otter-blocks", "patterns-accent") || null,
    };
  }, []);

  // Every template is built on Atomic Wind blocks, which only register when
  // their setting is on. With them off the library can't render or insert
  // anything, so gate the whole thing behind a one-click enable prompt.
  const atomicWindEnabled = useSelect(
    (select) => Boolean(select("core/blocks").getBlockType("atomic-wind/box")),
    [],
  );

  const setColumns = (value) =>
    set("themeisle/otter-blocks", "patterns-columns", value);

  const setAccent = (value) =>
    set("themeisle/otter-blocks", "patterns-accent", value);

  const toggleFavorite = useCallback(
    (pattern) => {
      if (favorites.includes(pattern)) {
        set(
          "themeisle/otter-blocks",
          "patterns-favorites",
          favorites.filter((name) => name !== pattern),
        );
      } else {
        set("themeisle/otter-blocks", "patterns-favorites", [
          ...favorites,
          pattern,
        ]);
      }
    },
    [favorites],
  );

  // Return only raw store references from useSelect — filtering in the
  // callback would produce a fresh array on every store change, which
  // useSelect's shallow comparison treats as a new value.
  const { allPatterns, allCategories, isResolvingPatterns } = useSelect(
    (select) => {
      const {
        getBlockPatterns,
        getBlockPatternCategories,
        hasFinishedResolution,
      } = select("core");

      return {
        allPatterns: getBlockPatterns(),
        allCategories: getBlockPatternCategories() || [],
        isResolvingPatterns:
          !hasFinishedResolution("getBlockPatterns") ||
          !hasFinishedResolution("getBlockPatternCategories"),
      };
    },
    [],
  );

  const registeredPatterns = useMemo(
    () =>
      allPatterns?.filter(
        (pattern) =>
          pattern?.categories && pattern?.categories.includes("otter-blocks"),
      ) || [],
    [allPatterns],
  );

  // Static Pro upsell cards. With a license, Otter Pro registers the real
  // patterns (otter-pro/<slug>, also tagged otter-blocks) and they arrive in
  // registeredPatterns above — so drop any upsell whose slug is already
  // registered, leaving only the not-yet-unlocked ones as upsells.
  const proUpsells = useMemo(
    () =>
      (window.themeisleGutenberg?.proPatterns || []).map((pattern) => ({
        ...pattern,
        content: "",
        categories: pattern.categories || ["otter-blocks"],
        keywords: pattern.keywords || [],
        elements: pattern.elements || [],
        isPro: true,
      })),
    [],
  );

  const slugOf = (name) => (name || "").split("/").pop();

  const patterns = useMemo(() => {
    const registeredSlugs = new Set(
      registeredPatterns.map((pattern) => slugOf(pattern.name)),
    );

    return [
      ...registeredPatterns,
      ...proUpsells.filter(
        (pattern) => !registeredSlugs.has(slugOf(pattern.name)),
      ),
    ];
  }, [registeredPatterns, proUpsells]);

  const { sectionGroups, collections, tcCategories, categoryLabels } =
    useMemo(() => {
      const usedCategories = [
        ...new Set(patterns.flatMap((pattern) => pattern.categories)),
      ];

      const categoryLabels = {};

      allCategories.forEach((category) => {
        categoryLabels[category.name] = category.label;
      });

      // Patterns in the "header" category are heroes.
      categoryLabels.header = __("Hero", "otter-blocks");

      const sectionCategories = usedCategories.filter(
        (name) =>
          !HIDDEN_CATEGORIES.includes(name) &&
          !isPackCategory(name) &&
          !isCloudCategory(name),
      );

      const sectionGroups = SECTION_GROUPS.map((group) => ({
        ...group,
        categories: group.categories
          .filter((name) => sectionCategories.includes(name))
          .map((name) => ({ name, label: categoryLabels[name] || name })),
      })).filter((group) => Boolean(group.categories.length));

      const leftovers = sectionCategories.filter(
        (name) =>
          !SECTION_GROUPS.some((group) => group.categories.includes(name)),
      );

      if (leftovers.length) {
        sectionGroups.push({
          id: "more",
          label: __("More", "otter-blocks"),
          categories: leftovers
            .map((name) => ({ name, label: categoryLabels[name] || name }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        });
      }

      // Packs that contain at least one free (registered) pattern; the rest
      // are Pro-only collections.
      const freePackCategories = new Set();
      patterns.forEach((pattern) => {
        if (!pattern.isPro) {
          pattern.categories.forEach((category) => {
            if (isPackCategory(category)) {
              freePackCategories.add(category);
            }
          });
        }
      });

      const collections = usedCategories
        .filter(isPackCategory)
        .map((name) => {
          const label = (categoryLabels[name] || name).replace(
            /\s*\(Pages\)\s*$/,
            "",
          );
          categoryLabels[name] = label;

          return { name, label, isPro: !freePackCategories.has(name) };
        })
        // Free packs first, then Pro; alphabetical within each group.
        .sort((a, b) =>
          a.isPro === b.isPro
            ? a.label.localeCompare(b.label)
            : a.isPro
              ? 1
              : -1,
        );

      const tcCategories = usedCategories
        .filter(isCloudCategory)
        .map((name) => ({ name, label: categoryLabels[name] || name }))
        .sort((a, b) => a.label.localeCompare(b.label));

      return {
        sectionGroups,
        collections,
        tcCategories,
        categoryLabels,
      };
    }, [patterns, allCategories]);

  const [mode, setModeRaw] = useState("sections");
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");

  // The input tracks `query` keystroke by keystroke; everything downstream
  // (token parsing, fuzzy search, filtering) reads the debounced copy so
  // the grid doesn't churn mid-word. Clearing skips the delay — stale
  // results lingering after the field empties read as a bug.
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const updateDebouncedQuery = useDebounce(setDebouncedQuery, 250);

  useEffect(() => {
    if (!query) {
      updateDebouncedQuery.cancel();
      setDebouncedQuery("");
      return;
    }

    updateDebouncedQuery(query);
  }, [query, updateDebouncedQuery]);
  const [favOnly, setFavOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [activeTags, setActiveTags] = useState([]);
  const [preview, setPreview] = useState(null);

  const isPage = "pages" === mode;

  const setMode = (value) => {
    setModeRaw(value);
    setActiveCategory("all");
  };

  // Patterns in the current mode, before any filtering.
  const modePatterns = useMemo(() => {
    return patterns.filter((pattern) => isPage === isPagePattern(pattern));
  }, [patterns, isPage]);

  // Per-category counts for the sidebar, independent of search and filters.
  const counts = useMemo(() => {
    const counts = { all: modePatterns.length };

    modePatterns.forEach((pattern) => {
      pattern.categories.forEach((category) => {
        counts[category] = (counts[category] || 0) + 1;
      });
    });

    return counts;
  }, [modePatterns]);

  // Scope: mode + category. Used for tag suggestions and filtering.
  const scope = useMemo(() => {
    return modePatterns.filter(
      (pattern) =>
        "all" === activeCategory || pattern.categories.includes(activeCategory),
    );
  }, [modePatterns, activeCategory]);

  const parsed = useMemo(() => parseQuery(debouncedQuery), [debouncedQuery]);

  // Fuzzy matching for the free-text part of the query, so typos and
  // partial words still find patterns. Indexed over all patterns — the
  // scope filters below narrow the results.
  const searchIndex = useMemo(
    () => createSearchIndex(patterns, categoryLabels),
    [patterns, categoryLabels],
  );

  const textMatches = useMemo(
    () => fuzzyMatches(searchIndex, parsed.text),
    [searchIndex, parsed],
  );

  // Refine tags with live counts. The suggested set stays stable per scope
  // (it doesn't reshuffle as you filter), but each tag's count is recomputed
  // against the current search, favorites and active tags so it reflects what
  // clicking it would actually return — and any tag that would yield nothing
  // is flagged disabled, so a filter never leads to an empty grid.
  const tags = useMemo(() => {
    const suggested = suggestTags(scope, 12);

    // Everything except the tag facets: these always constrain the counts.
    const base = scope
      .filter((pattern) => !favOnly || favorites.includes(pattern.name))
      .filter((pattern) =>
        parsed.tokens.every((token) => matchToken(pattern, token)),
      )
      .filter((pattern) => !textMatches || textMatches.has(pattern.name));

    return suggested.map((tag) => {
      const bucket = exclusiveBucket(tag);

      // Selecting a tag in an exclusive group replaces that group's current
      // choice, so its count ignores other active tags in the same bucket;
      // independent tags stack on top of every active tag.
      const others = activeTags.filter(
        (item) => !bucket || exclusiveBucket(item) !== bucket,
      );

      const count = base.filter(
        (pattern) =>
          matchToken(pattern, tag) &&
          others.every((token) => matchToken(pattern, token)),
      ).length;

      return { ...tag, count, disabled: 0 === count };
    });
  }, [scope, favOnly, favorites, parsed, textMatches, activeTags]);

  // Clear tag selections when the scope changes.
  useEffect(() => {
    setActiveTags([]);
  }, [mode, activeCategory]);

  const toggleTag = (tag) => {
    setActiveTags((current) => {
      if (current.some((item) => item.key === tag.key)) {
        return current.filter((item) => item.key !== tag.key);
      }

      // Single-choice facets (tone, layout, style) would AND into an empty
      // set if two values were active, so selecting one drops any other tag
      // in the same exclusivity bucket.
      const bucket = exclusiveBucket(tag);
      const kept = bucket
        ? current.filter((item) => exclusiveBucket(item) !== bucket)
        : current;

      return [
        ...kept,
        { key: tag.key, kind: tag.kind, group: tag.group, value: tag.value },
      ];
    });
  };

  // Removing a parsed token strips its source word from the query string.
  const onRemoveToken = (token) => {
    setQuery((current) =>
      current
        .split(/\s+/)
        .filter((word) => word.toLowerCase() !== token.word)
        .join(" "),
    );
  };

  const primaryCategoryLabel = (pattern) => {
    const category = pattern.categories.find(
      (name) => !HIDDEN_CATEGORIES.includes(name),
    );
    return category ? categoryLabels[category] || "" : "";
  };

  const filteredPatterns = useMemo(() => {
    let result = scope
      .filter((pattern) => !favOnly || favorites.includes(pattern.name))
      .filter((pattern) =>
        parsed.tokens.every((token) => matchToken(pattern, token)),
      )
      .filter((pattern) =>
        activeTags.every((token) => matchToken(pattern, token)),
      )
      .filter((pattern) => !textMatches || textMatches.has(pattern.name));

    if ("az" === sort) {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if ("za" === sort) {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    } else if (textMatches) {
      result = [...result].sort(
        (a, b) => textMatches.get(a.name) - textMatches.get(b.name),
      );
    }

    return result;
  }, [scope, parsed, activeTags, favOnly, favorites, sort, textMatches]);

  // "More like this" suggestions for the preview overlay.
  const similarPatterns = useMemo(() => {
    if (!preview) {
      return [];
    }

    return similar(
      preview,
      patterns.filter(
        (pattern) => isPagePattern(preview) === isPagePattern(pattern),
      ),
      4,
    );
  }, [preview, patterns]);

  const insertPattern = useCallback(
    (pattern) => {
      // Pro upsell cards carry no content — they can't be inserted. Send the
      // user to the Pro patterns page in a new tab and leave the library open
      // so they can keep browsing.
      if (pattern.isPro) {
        const url =
          window.themeisleGutenberg?.patternsLink ||
          window.themeisleGutenberg?.upgradeLink;

        if (url) {
          window.open(url, "_blank");
        }

        return;
      }

      // With Pro active the upsell banner removes itself right after
      // insertion anyway — skip it up front.
      const blocks = parse(accentContent(pattern, accent)).filter(
        (block) =>
          UPSELL_BLOCK !== block.name ||
          !Boolean(window.themeisleGutenberg?.hasPro),
      );

      // Inserting unregistered blocks would just dump raw markup into the
      // canvas — tell the user what's missing instead. Atomic Wind blocks
      // only register when their toggle in Otter's settings is on, so for
      // those we can point at the fix directly.
      const missing = [...new Set(findMissingBlocks(blocks))];

      if (missing.length) {
        const needsAtomicWind = missing.some((name) =>
          name.startsWith("atomic-wind/"),
        );
        const optionsPath = window.themeisleGutenberg?.optionsPath;

        createWarningNotice(
          needsAtomicWind
            ? sprintf(
                // translators: %s is the name of the template.
                __(
                  '"%s" needs the Atomic Wind blocks, which are currently disabled. Enable them in Otter\'s settings, then insert the template again.',
                  "otter-blocks",
                ),
                pattern.title,
              )
            : sprintf(
                // translators: %1$s is the name of the template, %2$s is a list of block names.
                __(
                  '"%1$s" needs blocks that aren\'t available on this site: %2$s',
                  "otter-blocks",
                ),
                pattern.title,
                missing.join(", "),
              ),
          {
            isDismissible: true,
            actions:
              needsAtomicWind && optionsPath
                ? [
                    {
                      label: __("Open Otter settings", "otter-blocks"),
                      onClick: () => window.open(optionsPath, "_blank"),
                    },
                  ]
                : [],
          },
        );

        onClose();
        return;
      }

      // Blocks disabled in the Block Manager are folded into the editor's
      // allowedBlockTypes setting, and insertBlocks silently drops every
      // block that isn't allowed. Inserting a chosen template is explicit
      // intent — lift the restriction for the duration of the insert.
      const { allowedBlockTypes } = select("core/block-editor").getSettings();
      const { updateSettings } = dispatch("core/block-editor");

      updateSettings({ allowedBlockTypes: true });

      try {
        if (clientID) {
          insertBlockBelow(clientID, blocks);
        } else {
          insertBlocks(blocks);
        }
      } finally {
        updateSettings({ allowedBlockTypes });
      }

      createSuccessNotice(
        sprintf(
          // translators: %s is the name of the inserted template.
          __('"%s" inserted.', "otter-blocks"),
          pattern.title,
        ),
        { type: "snackbar" },
      );

      onClose();
    },
    [clientID, accent],
  );

  const resetFilters = () => {
    setQuery("");
    setFavOnly(false);
    setActiveCategory("all");
    setActiveTags([]);
  };

  const onRequestClose = () => {
    if (preview) {
      setPreview(null);
      return;
    }

    onClose();
  };

  const isCloudPlaceholder = CLOUD_EMPTY_CATEGORY === activeCategory;

  return (
    <Modal
      onRequestClose={onRequestClose}
      className="o-library__modal"
      overlayClassName="o-library__overlay"
      __experimentalHideHeader
    >
      <header className="o-library__head">
        <div className="o-library__brand">
          <span className="o-library__logo">{otterMascot({})}</span>
          <h1>{__("Design Library", "otter-blocks")}</h1>
        </div>

        <button
          className="o-library__iconbtn"
          aria-label={__("Close library", "otter-blocks")}
          onClick={onClose}
        >
          <Icon icon={close} size={24} />
        </button>
      </header>

      <div className="o-library__body">
        {!atomicWindEnabled && <EnableAtomicWind />}

        {atomicWindEnabled && (
          <>
        <Sidebar
          mode={mode}
          setMode={setMode}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          sectionGroups={sectionGroups}
          collections={collections}
          tcCategories={tcCategories}
          counts={counts}
          isLoading={isResolvingPatterns}
          accent={accent}
          setAccent={setAccent}
          showCloudPlaceholder={
            !tcCategories.length &&
            Boolean(window?.themeisleGutenberg?.hasPatternSources)
          }
          cloudEmptyCategory={CLOUD_EMPTY_CATEGORY}
        />

        <main className="o-library__main">
          {isResolvingPatterns && (
            <>
              <TopbarSkeleton />
              <TagRowSkeleton />

              <div className="o-library__scroll" aria-busy="true">
                <div
                  className="o-library__grid"
                  style={{ "--o-lib-cols": columns }}
                >
                  {Array.from({ length: columns * 3 }).map((_, index) => (
                    <div
                      key={index}
                      className={`o-library__card is-skeleton${
                        isPage ? " is-page" : ""
                      }`}
                    >
                      <div className="o-library__thumb">
                        <div className="o-library__thumb-skeleton" />
                      </div>
                      <div className="o-library__card-foot">
                        <span className="o-library__skeleton-line" />
                        <span className="o-library__skeleton-line is-short" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {isCloudPlaceholder && <CloudLibraryPlaceholder />}

          {!isCloudPlaceholder && !isResolvingPatterns && (
            <>
              <Topbar
                query={query}
                setQuery={setQuery}
                count={filteredPatterns.length}
                favCount={favorites.length}
                favOnly={favOnly}
                setFavOnly={setFavOnly}
                sort={sort}
                setSort={setSort}
                columns={columns}
                setColumns={setColumns}
                tokens={parsed.tokens}
                onRemoveToken={onRemoveToken}
                categoryLabels={categoryLabels}
              />

              <SmartTagRow
                tags={tags}
                active={activeTags.map((tag) => tag.key)}
                onToggle={toggleTag}
              />

              <div className="o-library__scroll">
                {!filteredPatterns.length && (
                  <div className="o-library__empty">
                    <Icon icon={search} size={40} />
                    <h3>{__("No templates match", "otter-blocks")}</h3>
                    <p>
                      {__(
                        "Try a different search or clear your filters.",
                        "otter-blocks",
                      )}
                    </p>
                    <button
                      className="o-library__btn is-ghost"
                      onClick={resetFilters}
                    >
                      {__("Clear filters", "otter-blocks")}
                    </button>
                  </div>
                )}

                <div
                  className="o-library__grid"
                  style={{ "--o-lib-cols": columns }}
                >
                  {filteredPatterns.map((pattern) => (
                    <Template
                      key={pattern.name}
                      pattern={pattern}
                      categoryLabel={primaryCategoryLabel(pattern)}
                      isPage={isPage}
                      isFavorite={favorites.includes(pattern.name)}
                      accent={accent}
                      onInsert={insertPattern}
                      onPreview={setPreview}
                      onFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
          </>
        )}
      </div>

      {preview && (
        <Preview
          pattern={preview}
          categoryLabel={primaryCategoryLabel(preview)}
          isPage={isPagePattern(preview)}
          isFavorite={favorites.includes(preview.name)}
          accent={accent}
          similar={similarPatterns}
          onFavorite={() => toggleFavorite(preview.name)}
          onClose={() => setPreview(null)}
          onInsert={() => insertPattern(preview)}
          onPreviewOther={setPreview}
        />
      )}
    </Modal>
  );
};

export default Library;
