/**
 * External dependencies.
 */
import classnames from 'classnames';

import { useInView } from 'react-intersection-observer';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { parse } from '@wordpress/blocks';

import { BlockPreview } from '@wordpress/block-editor';

import {
	memo,
	useEffect,
	useMemo,
	useRef,
	useState
} from '@wordpress/element';

import {
	Icon,
	lock,
	plus
} from '@wordpress/icons';

/**
 * Internal dependencies.
 */
import {
	heartIcon,
	heartFilledIcon
} from '../../helpers/icons';

import { previewAccent } from './accent';

import { useAtomicCss } from './atomic';

// Queues previews so they render one at a time during idle frames,
// like the core inserter. Not available before WP 6.4 — render directly then.
export const AsyncPreview = BlockPreview.Async || ( ({ children }) => children );

// Pattern content embeds this Pro-upsell banner. Its edit component
// dispatches removeBlock on itself when Otter Pro is active, which crashes
// the modal when it mounts inside a BlockPreview — never preview it.
export const UPSELL_BLOCK = 'themeisle-blocks/patterns-upsell';

export const Skeleton = () => <div className="o-library__thumb-skeleton" />;

// A stable hue per pattern name, for the screenshot placeholder gradient.
const hueFromName = ( name = '' ) => {
	let hue = 0;

	for ( let index = 0; index < name.length; index++ ) {
		hue = ( hue * 31 + name.charCodeAt( index ) ) % 360;
	}

	return hue;
};

// Pro patterns ship no content — only a screenshot. The image is served from a
// (swappable) base URL that may not be populated yet, so fall back to a tinted
// placeholder carrying the pattern title until a real screenshot loads.
export const ProThumb = ({ pattern }) => {
	const [ failed, setFailed ] = useState( false );
	const hue = hueFromName( pattern.name );

	if ( failed || ! pattern.screenshot ) {
		return (
			<div
				className="o-library__shot is-fallback"
				style={ { '--o-lib-hue': hue } }
			>
				<span>{ pattern.title }</span>
			</div>
		);
	}

	return (
		<img
			className="o-library__shot"
			src={ pattern.screenshot }
			alt={ pattern.title }
			loading="lazy"
			onError={ () => setFailed( true ) }
		/>
	);
};

// Parsing a pattern is the expensive synchronous part of a preview, and
// tiles unmount/remount as they scroll in and out of view — keep the
// parsed blocks around so a remount only pays for the iframe.
const parsedBlocks = new Map();

export const parsePattern = ( pattern ) => {
	if ( ! parsedBlocks.has( pattern.name ) ) {
		parsedBlocks.set( pattern.name, parse( pattern.content ).filter( block => UPSELL_BLOCK !== block.name ) );
	}

	return parsedBlocks.get( pattern.name );
};

// Patterns whose preview has painted once this session.
const renderedOnce = new Set();

// Mounting a BlockPreview doesn't mean it has painted: the iframe boots,
// styles are cloned in and the blocks portal in over several frames, all
// showing as a white rectangle. Keep the iframe hidden with the placeholder
// on top until the block layout actually exists inside the iframe document,
// then crossfade (see .o-library__live in editor.scss).
export const ParsedPreview = ({ pattern, css = [], placeholder = <Skeleton /> }) => {
	const containerRef = useRef( null );
	const [ isReady, setIsReady ] = useState( false );

	useEffect( () => {
		setIsReady( false );

		let frame;

		// If the layout never shows up (no-iframe previews on older WP, an
		// empty pattern), reveal anyway rather than shimmer forever.
		const deadline = setTimeout( () => {
			cancelAnimationFrame( frame );
			setIsReady( true );
		}, 4000 );

		const check = () => {
			const frameDocument = containerRef.current?.querySelector( 'iframe' )?.contentDocument;

			// Blocks portal in before the linked stylesheets finish loading,
			// and unstyled content renders at the wrong size (SVGs especially).
			// A link's `sheet` stays null until it has loaded and parsed —
			// require every stylesheet too, not just the layout. Links that
			// fail to load keep a null sheet; the deadline covers those.
			const hasLayout = Boolean( frameDocument?.querySelector( '.block-editor-block-list__layout' ) );
			const hasStyles = hasLayout && Array.from( frameDocument.querySelectorAll( 'link[rel="stylesheet"]' ) )
				.every( link => null !== link.sheet );

			if ( hasLayout && hasStyles ) {
				clearTimeout( deadline );
				renderedOnce.add( pattern.name );
				setIsReady( true );
				return;
			}

			frame = requestAnimationFrame( check );
		};

		frame = requestAnimationFrame( check );

		return () => {
			clearTimeout( deadline );
			cancelAnimationFrame( frame );
		};
	}, [ pattern.name ]);

	const styles = css.filter( Boolean ).map( value => ({ css: value }) );

	return (
		<div
			className={ classnames( 'o-library__live', { 'is-ready': isReady }) }
			ref={ containerRef }
		>
			<BlockPreview
				blocks={ parsePattern( pattern ) }
				viewportWidth={ pattern.viewportWidth || 1400 }
				additionalStyles={ styles.length ? styles : undefined }
			/>

			{ ! isReady && placeholder }
		</div>
	);
};

// Shows a skeleton until the idle queue reaches this preview, then parses
// and renders it — both the parse and the iframe mount happen off the
// critical path, one pattern at a time. Patterns the user has already seen
// skip the queue: their parse and images are cached, so the iframe boots
// near-instantly and a remount only flashes the skeleton for a few frames.
export const QueuedPreview = ({ pattern, accent = null }) => {
	// Atomic Wind patterns recolor through CSS variables (same markup, same
	// parse cache); classic patterns come back as a derived pattern whose
	// new name keys the caches naturally.
	const { pattern: derived, css } = previewAccent( pattern, accent );

	// Atomic Wind utilities first, accent variables after so they win.
	const { css: atomicCss, isReady: hasAtomicCss } = useAtomicCss( derived );

	// Skipping the queue is decided once per pattern name, not per render:
	// the first paint adds the name to renderedOnce, so re-checking on a
	// later render (the first accent change re-renders every tile) would
	// flip the branch below from AsyncPreview to a bare ParsedPreview — a
	// different element type, which remounts the iframe and flashes every
	// tile's skeleton at once.
	const skipQueue = useMemo( () => renderedOnce.has( derived.name ), [ derived.name ]);

	if ( ! hasAtomicCss ) {
		return <Skeleton />;
	}

	if ( skipQueue ) {
		return <ParsedPreview pattern={ derived } css={ [ atomicCss, css ] } />;
	}

	return (
		<AsyncPreview placeholder={ <Skeleton /> }>
			<ParsedPreview pattern={ derived } css={ [ atomicCss, css ] } />
		</AsyncPreview>
	);
};

const Template = ({
	pattern,
	categoryLabel,
	isPage = false,
	isFavorite = false,
	accent = null,
	onInsert = () => {},
	onPreview = () => {},
	onFavorite = () => {}
}) => {
	// Mount the iframe preview only while the card is near the viewport and
	// drop back to the skeleton once it scrolls far away — keeping every
	// seen preview alive accumulates hundreds of live iframes over a long
	// browse, so the window bounds how many exist at once (roughly a screen
	// and a half of cards). Scrolling back remounts almost instantly: the
	// parse is cached and renderedOnce skips the idle queue. The margin is
	// deeper below than above: browsing moves downward, so mount ahead of
	// the scroll.
	const { ref, inView } = useInView({
		threshold: 0,
		rootMargin: '300px 0px 600px 0px'
	});

	const isPro = Boolean( pattern.isPro );

	// Both the live previews and the Pro screenshots only render once the card
	// nears the viewport — the screenshot's <img> is also natively lazy — so a
	// long library never mounts hundreds of previews or fetches every upsell
	// image up front.
	const thumbnail = ! inView
		? <Skeleton />
		: ( isPro ? <ProThumb pattern={ pattern } /> : <QueuedPreview pattern={ pattern } accent={ accent } /> );

	const favoriteButton = (
		<button
			className={ classnames( 'o-library__fav', { 'is-on': isFavorite }) }
			title={ isFavorite ? __( 'Remove from favorites', 'otter-blocks' ) : __( 'Add to favorites', 'otter-blocks' ) }
			onClick={ () => onFavorite( pattern.name ) }
		>
			{ ( isFavorite ? heartFilledIcon : heartIcon )({ width: 16, height: 16 }) }
		</button>
	);

	return (
		<div
			className={ classnames( 'o-library__card', { 'is-page': isPage }) }
			ref={ ref }
		>
			<div className="o-library__thumb">
				{ thumbnail }

				{ isPro && (
					<span className="o-library__pro-badge">
						<Icon icon={ lock } size={ 14 } />
						{ __( 'Pro', 'otter-blocks' ) }
					</span>
				) }

				{ favoriteButton }

				<div
					className="o-library__card-overlay"
					role="presentation"
					onClick={ event => {
						if ( event.target !== event.currentTarget ) {
							return;
						}

						// Clicking a Pro card anywhere does the same as "Get with
						// Pro"; free cards open the preview.
						if ( isPro ) {
							onInsert( pattern );
						} else {
							onPreview( pattern );
						}
					} }
				>
					{ ! isPro && (
						<button className="o-library__btn is-ghost is-ondark" onClick={ () => onPreview( pattern ) }>
							{ __( 'Preview', 'otter-blocks' ) }
						</button>
					) }

					{ isPro ? (
						<button className="o-library__btn is-primary" onClick={ () => onInsert( pattern ) }>
							<Icon icon={ lock } size={ 18 } />
							{ __( 'Get with Pro', 'otter-blocks' ) }
						</button>
					) : (
						<button className="o-library__btn is-primary" onClick={ () => onInsert( pattern ) }>
							<Icon icon={ plus } size={ 20 } />
							{ __( 'Insert', 'otter-blocks' ) }
						</button>
					) }
				</div>
			</div>

			<div className="o-library__card-foot">
				<span className="o-library__card-name">{ pattern.title }</span>
				{ Boolean( categoryLabel ) && <span className="o-library__card-cat">{ categoryLabel }</span> }
			</div>
		</div>
	);
};

export default memo( Template );
