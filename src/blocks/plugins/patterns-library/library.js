/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { parse } from '@wordpress/blocks';

import {
	Button,
	DropdownMenu,
	Modal,
	SearchControl,
	Spinner
} from '@wordpress/components';

import {
	useDispatch,
	useSelect
} from '@wordpress/data';

import {
	useMemo,
	useState
} from '@wordpress/element';

import { external, grid, Icon } from '@wordpress/icons';

/**
 * Internal dependencies.
 */
import { insertBlockBelow } from '../../helpers/block-utility';
import Template from './template';
import Preview from './preview';
import CloudLibraryPlaceholder from './cloudLibraryPlaceholder';

const CLOUD_EMPTY_CATEGORY = 'cloud-empty';

const Library = ({
	onClose
}) => {
	const { insertBlocks } = useDispatch( 'core/block-editor' );
	const { set } = useDispatch( 'core/preferences' );

	const {
		clientID,
		getFavorites
	} = useSelect( ( select ) => {
		const { getSelectedBlockClientId } = select( 'core/block-editor' );
		const { get } = select( 'core/preferences' );

		return {
			clientID: getSelectedBlockClientId(),
			getFavorites: get( 'themeisle/otter-blocks', 'patterns-favorites' ) || []
		};
	}, []);

	const toggleFavorite = ( pattern ) => {
		const favorites = getFavorites;

		if ( favorites.includes( pattern ) ) {
			set( 'themeisle/otter-blocks', 'patterns-favorites', favorites.filter( name => name !== pattern ) );
		} else {
			set( 'themeisle/otter-blocks', 'patterns-favorites', [ ...favorites, pattern ]);
		}
	};

	const {
		patterns,
		categories,
		tcCategories,
		isResolvingPatterns
	} = useSelect( ( select ) => {
		const {
			getBlockPatterns,
			getBlockPatternCategories,
			isResolving
		} = select( 'core' );

		const patterns = getBlockPatterns()?.filter( pattern => pattern?.categories && pattern?.categories.includes( 'otter-blocks' ) );

		const allCategories = getBlockPatternCategories();

		const patternCategories = [ ...new Set( patterns.flatMap( pattern => pattern.categories.filter( category => {
			return ! category.startsWith( 'ti-tc-' );
		} ) ) ) ];
		const tcPatternCategories = [ ...new Set( patterns.flatMap( pattern => pattern.categories.filter( category => { return category.startsWith( 'ti-tc-' ); } ) ) ) ];

		const categories = [ ...allCategories.filter( category => patternCategories.includes( category?.name ) ) ];
		const tcCategories = [ ...allCategories.filter( category => tcPatternCategories.includes( category?.name ) ) ];

		categories.forEach( category => {
			if ( 'otter-blocks' === category?.name ) {
				category.label = __( 'All', 'otter-blocks' );
			}

			if ( 'header' === category?.name ) {
				category.label = __( 'Hero', 'otter-blocks' );
			}
		});

		categories.sort( ( a, b ) => a.label.localeCompare( b.label ) );

		// Move footer category to the end.
		const footerCategory = categories.find( category => 'footer' === category.name );

		if ( footerCategory ) {
			categories.push( categories.splice( categories.indexOf( footerCategory ), 1 )[0]);
		}

		// Remove featured category.
		const featuredCategory = categories.find( category => 'featured' === category.name );

		if ( featuredCategory ) {
			categories.splice( categories.indexOf( featuredCategory ), 1 );
		}

		const packCategories = categories.filter( category => category.name.includes( '-pack' ) );

		packCategories.forEach( packCategory => {
			const index = categories.indexOf( packCategory );
			if ( -1 < index ) {
				categories.splice( index, 1 );
			}
		});

		// Adding all the Template Packs to the top.
		const allCategoryIndex = categories.findIndex( category => category.label === __( 'All', 'otter-blocks' ) );

		categories.splice( allCategoryIndex + 1, 0, ...packCategories );

		return {
			patterns,
			tcCategories,
			categories,
			isResolvingPatterns: isResolving( 'core', 'getBlockPatterns' ) || isResolving( 'core', 'getBlockPatternCategories' )
		};
	}, []);

	const [ selectedCategory, setSelectedCategory ] = useState( 'otter-blocks' );
	const [ searchInput, setSearchInput ] = useState( '' );
	const [ layout, setLayout ] = useState( 3 );
	const [ selectedTemplate, setSelectedTemplate ] = useState( null );
	const [ bulkSelection, setBulkSelection ] = useState([]);

	const filteredPatterns = useMemo( () => {
		const currentCategory = 'favorites' === selectedCategory ? patterns.filter( pattern => getFavorites.includes( pattern.name ) ) : patterns.filter( pattern => pattern.categories.includes( selectedCategory ) );

		if ( searchInput ) {
			return currentCategory.filter( pattern => pattern.title.toLowerCase().includes( searchInput.toLowerCase() ) );
		}

		return currentCategory;
	}, [ patterns, selectedCategory, searchInput ]);

	const onBulkSelection = ( pattern ) => {
		if ( bulkSelection.includes( pattern ) ) {
			setBulkSelection( bulkSelection.filter( name => name !== pattern ) );
		} else {
			setBulkSelection([ ...bulkSelection, pattern ]);
		}
	};

	const insertPattern = ( pattern ) => {
		const blocks = parse( pattern );

		if ( clientID ) {
			insertBlockBelow( clientID, blocks );
		} else {
			insertBlocks( parse( pattern ) );
		}

		onClose();
	};

	const onBulkInsertion = () => {
		const blocks = bulkSelection.map( pattern => parse( patterns.find( item => item.name === pattern ).content ) ).flat();

		if ( clientID ) {
			insertBlockBelow( clientID, blocks );
		} else {
			insertBlocks( blocks );
		}

		onClose();
	};

	return (
		<Modal
			title={ __( 'Design Library', 'otter-blocks' ) }
			onRequestClose={ onClose }
			size="fill"
			className="o-library__modal"
		>
			{ ! selectedTemplate && (
				<>
					{ isResolvingPatterns && (
						<div className="o-library__modal__loading">
							<Spinner />
						</div>
					) }

					<div className="o-library__modal__sidebar">
						<Button
							icon="heart"
							isPressed={ 'favorites' === selectedCategory }
							onClick={ () => setSelectedCategory( 'favorites' ) }
						>
							{ __( 'My Favorites', 'otter-blocks' ) }
						</Button>

						{( tcCategories.length < 1 && Boolean( window?.themeisleGutenberg?.hasPatternSources ) ) && (
							<Button
								icon="open-folder"
								isPressed={ 'cloud-empty' === selectedCategory }
								onClick={ () => setSelectedCategory( CLOUD_EMPTY_CATEGORY ) }
							>
								{ __( 'Cloud Libraries', 'otter-blocks' ) }
							</Button>
						) }

						{ ( ! Boolean( window.themeisleGutenberg.hasPro ) ) && (
							<Button
								icon="lock"
								href="https://themeisle.com/plugins/otter-blocks/patterns/"
								target="_blank"
							>
								{ __( 'Premium Designs', 'otter-blocks' ) }
								<Icon icon={external} size={15} />
							</Button>
						) }


						{tcCategories.length > 0 && (
							<>
								<p className="o-library__modal__sidebar__heading">
									{__('Cloud Libraries', 'otter-blocks')}
								</p>

								<ul className="o-library__modal__categories">
									{tcCategories.map(category => (
										<li key={category.name}>
											<Button
												isPressed={selectedCategory === category.name}
												onClick={() => setSelectedCategory(category.name)}
											>
												{category.label}
											</Button>
										</li>
									))}
								</ul>
							</>
						)}

						<p className="o-library__modal__sidebar__heading">
							{ __( 'Categories', 'otter-blocks' ) }
						</p>

						<ul className="o-library__modal__categories">
							{ categories.map( category => (
								<li key={ category.name }>
									<Button
										isPressed={ selectedCategory === category.name }
										onClick={ () => setSelectedCategory( category.name ) }
									>
										{ category.label }
									</Button>
								</li>
							) )}
						</ul>
					</div>

					<div className="o-library__modal__content">
						{( selectedCategory === CLOUD_EMPTY_CATEGORY && Boolean( window?.themeisleGutenberg?.hasPatternSources ) ) && <CloudLibraryPlaceholder />}
						{selectedCategory !== CLOUD_EMPTY_CATEGORY && (
							<>
								<div className="o-library__modal__content__actions">
									<SearchControl
										__nextHasNoMarginBottom
										hideLabelFromVision
										label={__('Search', 'otter-blocks')}
										value={searchInput}
										onChange={setSearchInput}
									/>

									<DropdownMenu
										icon={grid}
										label={__('Layout', 'otter-blocks')}
										controls={[
											{
												title: __('2 Column', 'otter-blocks'),
												onClick: () => setLayout(2)
											},
											{
												title: __('3 Column', 'otter-blocks'),
												onClick: () => setLayout(3)
											},
											{
												title: __('4 Column', 'otter-blocks'),
												onClick: () => setLayout(4)
											}
										]}
									/>
								</div>

								<div
									className={
										classnames(
											'o-library__modal__content__grid',
											{
												[`is-${layout}-column`]: layout
											}
										)
									}
								>
									{!filteredPatterns.length && (
										<p className="o-library__modal__content__grid__empty">
											{__('No patterns found.', 'otter-blocks')}
										</p>
									)}

									{filteredPatterns.map(pattern => (
										<Template
											key={pattern.name}
											onInsert={() => insertPattern(pattern.content)}
											isSelected={bulkSelection.includes(pattern.name)}
											isFavorite={getFavorites.includes(pattern.name)}
											onPreview={() => setSelectedTemplate(pattern)}
											onSelect={() => onBulkSelection(pattern.name)}
											onFavorite={() => toggleFavorite(pattern.name)}
											{...pattern}
										/>
									))}
								</div>
							</>
						)}
					</div>

					{!!bulkSelection.length && (
						<div className="o-library__modal__footer">
							<Button
								variant="tertiary"
								onClick={() => setBulkSelection([])}
							>
								{__('Cancel', 'otter-blocks')}
							</Button>

							<Button
								variant="primary"
								onClick={onBulkInsertion}
							>
								{__('Insert', 'otter-blocks')}
							</Button>
						</div>
					)}
				</>
			)}

			{selectedTemplate && (
				<Preview
					onBack={() => setSelectedTemplate(null)}
					onInsert={() => insertPattern(selectedTemplate.content)}
					{...selectedTemplate}
				/>
			)}
		</Modal>
	);
};

export default Library;
