/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	ColorPicker,
	Popover
} from '@wordpress/components';

import { useState } from '@wordpress/element';

import {
	chevronDown,
	external,
	Icon,
	layout,
	lock,
	page
} from '@wordpress/icons';

/**
 * Internal dependencies.
 */
import { ACCENT_PRESETS } from './accent';

const CategoryRow = ({
	id,
	label,
	count,
	isActive,
	onSelect,
	className,
	children,
	afterLabel
}) => (
	<button
		className={ classnames( 'o-library__cat', className, { 'is-active': isActive }) }
		onClick={ () => onSelect( id ) }
	>
		{ children }
		<span className="o-library__cat-label">{ label }</span>
		{ afterLabel }
		{ undefined !== count && <span className="o-library__count">{ count }</span> }
	</button>
);

// Skeleton mirror of the category nav: an "all" row plus a few grouped rows,
// so the sidebar keeps its width and rhythm while pattern categories resolve
// rather than reflowing once they land.
const NAV_SKELETON = [
	{ rows: [ 62, 74, 58 ] },
	{ rows: [ 70, 54, 80, 66 ] },
	{ rows: [ 60, 76 ] }
];

const NavSkeleton = () => (
	<>
		<div className="o-library__cat is-skeleton">
			<span className="o-library__shimmer" style={{ width: '55%', height: 13, borderRadius: 4 }} />
		</div>

		{ NAV_SKELETON.map( ( group, groupIndex ) => (
			<div key={ groupIndex } className="o-library__group">
				<div className="o-library__group-head is-static">
					<span className="o-library__shimmer" style={{ width: 86, height: 9, borderRadius: 3 }} />
				</div>

				<div className="o-library__group-body">
					{ group.rows.map( ( width, rowIndex ) => (
						<div key={ rowIndex } className="o-library__cat is-skeleton">
							<span className="o-library__shimmer" style={{ width: `${ width }%`, height: 12, borderRadius: 4 }} />
						</div>
					) ) }
				</div>
			</div>
		) ) }
	</>
);

const AccentPanel = ({ accent, setAccent, isLoading }) => {
	const [ pickerOpen, setPickerOpen ] = useState( false );

	const isCustom = Boolean( accent ) && ! ACCENT_PRESETS.some( preset => preset.color === accent );

	// Shimmer the swatch row while patterns resolve so the whole library reads
	// as one loading surface, then settles into the real picker in place.
	if ( isLoading ) {
		return (
			<div className="o-library__accent">
				<div className="o-library__accent-head">{ __( 'Accent color', 'otter-blocks' ) }</div>

				<div className="o-library__accent-row" aria-hidden="true">
					{ Array.from({ length: ACCENT_PRESETS.length + 2 }).map( ( _, index ) => (
						<span
							key={ index }
							className="o-library__shimmer"
							style={{ width: 26, height: 26, borderRadius: '50%' }}
						/>
					) ) }
				</div>
			</div>
		);
	}

	return (
		<div className="o-library__accent">
			<div className="o-library__accent-head">{ __( 'Accent color', 'otter-blocks' ) }</div>

			<div className="o-library__accent-row">
				<button
					className={ classnames( 'o-library__swatch is-default', { 'is-active': ! accent }) }
					title={ __( 'Original colors', 'otter-blocks' ) }
					aria-label={ __( 'Original colors', 'otter-blocks' ) }
					onClick={ () => setAccent( null ) }
				/>

				{ ACCENT_PRESETS.map( preset => (
					<button
						key={ preset.color }
						className={ classnames( 'o-library__swatch', { 'is-active': accent === preset.color }) }
						style={{ background: preset.color }}
						title={ preset.label }
						aria-label={ preset.label }
						onClick={ () => setAccent( preset.color ) }
					/>
				) ) }

				<span className="o-library__swatch-wrap">
					<button
						className={ classnames( 'o-library__swatch is-custom', { 'is-active': isCustom }) }
						style={ isCustom ? { background: accent } : undefined }
						title={ __( 'Custom color', 'otter-blocks' ) }
						aria-label={ __( 'Custom color', 'otter-blocks' ) }
						onClick={ () => setPickerOpen( ! pickerOpen ) }
					/>

					{ pickerOpen && (
						<Popover
							className="o-library__accent-popover"
							placement="top-start"
							onClose={ () => setPickerOpen( false ) }
						>
							<ColorPicker
								color={ isCustom ? accent : '#2563eb' }
								enableAlpha={ false }
								onChange={ ( value ) => setAccent( value.slice( 0, 7 ) ) }
							/>
						</Popover>
					) }
				</span>
			</div>
		</div>
	);
};

const Sidebar = ({
	mode,
	setMode,
	activeCategory,
	setActiveCategory,
	sectionGroups,
	collections,
	tcCategories,
	counts,
	isLoading,
	accent,
	setAccent,
	showCloudPlaceholder,
	cloudEmptyCategory
}) => {
	const [ collapsed, setCollapsed ] = useState([]);

	const toggleGroup = ( id ) => {
		setCollapsed( current => current.includes( id ) ? current.filter( group => group !== id ) : [ ...current, id ]);
	};

	const segments = [
		{ id: 'sections', icon: layout, label: __( 'Sections', 'otter-blocks' ) },
		{ id: 'pages', icon: page, label: __( 'Pages', 'otter-blocks' ) }
	];

	return (
		<aside className="o-library__sidebar">
			<div className="o-library__seg-wrap">
				{ segments.map( segment => (
					<button
						key={ segment.id }
						className={ classnames( 'o-library__seg', { 'is-active': mode === segment.id }) }
						onClick={ () => setMode( segment.id ) }
					>
						<Icon icon={ segment.icon } size={ 20 } />
						{ segment.label }
					</button>
				) ) }
			</div>

			<nav className="o-library__nav" aria-busy={ isLoading }>
				{ isLoading && <NavSkeleton /> }

				{ ! isLoading && (
					<>
						<CategoryRow
							id="all"
							label={ 'pages' === mode ? __( 'All Pages', 'otter-blocks' ) : __( 'All Sections', 'otter-blocks' ) }
							count={ counts.all }
							isActive={ 'all' === activeCategory }
							onSelect={ setActiveCategory }
						/>

						{ 'sections' === mode && sectionGroups.map( group => (
							<div key={ group.id } className="o-library__group">
								<button className="o-library__group-head" onClick={ () => toggleGroup( group.id ) }>
									<Icon
										icon={ chevronDown }
										size={ 20 }
										style={{ transform: collapsed.includes( group.id ) ? 'rotate(-90deg)' : 'none' }}
									/>
									{ group.label }
								</button>

								{ ! collapsed.includes( group.id ) && (
									<div className="o-library__group-body">
										{ group.categories.map( category => (
											<CategoryRow
												key={ category.name }
												id={ category.name }
												label={ category.label }
												count={ counts[ category.name ] || 0 }
												isActive={ activeCategory === category.name }
												onSelect={ setActiveCategory }
											/>
										) ) }
									</div>
								) }
							</div>
						) ) }

						{ 'pages' === mode && Boolean( collections.length ) && (
							<div className="o-library__group">
								<div className="o-library__group-head is-static">{ __( 'Collections', 'otter-blocks' ) }</div>

								<div className="o-library__group-body">
									{ collections.map( collection => (
										<CategoryRow
											key={ collection.name }
											id={ collection.name }
											label={ collection.label }
											count={ counts[ collection.name ] || 0 }
											isActive={ activeCategory === collection.name }
											onSelect={ setActiveCategory }
											className="is-collection"
											afterLabel={
												collection.isPro ? (
													<span
														className="o-library__coll-lock"
														title={ __( 'Pro', 'otter-blocks' ) }
													>
														<Icon icon={ lock } size={ 14 } />
													</span>
												) : undefined
											}
										/>
									) ) }
								</div>
							</div>
						) }

						{ 'sections' === mode && Boolean( tcCategories.length ) && (
							<div className="o-library__group">
								<div className="o-library__group-head is-static">{ __( 'Cloud Libraries', 'otter-blocks' ) }</div>

								<div className="o-library__group-body">
									{ tcCategories.map( category => (
										<CategoryRow
											key={ category.name }
											id={ category.name }
											label={ category.label }
											count={ counts[ category.name ] || 0 }
											isActive={ activeCategory === category.name }
											onSelect={ setActiveCategory }
										/>
									) ) }
								</div>
							</div>
						) }

						{ 'sections' === mode && showCloudPlaceholder && (
							<div className="o-library__group">
								<div className="o-library__group-head is-static">{ __( 'Cloud Libraries', 'otter-blocks' ) }</div>

								<div className="o-library__group-body">
									<CategoryRow
										id={ cloudEmptyCategory }
										label={ __( 'Add Sources', 'otter-blocks' ) }
										isActive={ activeCategory === cloudEmptyCategory }
										onSelect={ setActiveCategory }
									/>
								</div>
							</div>
						) }
					</>
				) }
			</nav>

			<AccentPanel accent={ accent } setAccent={ setAccent } isLoading={ isLoading } />

			{ ! Boolean( window.themeisleGutenberg?.hasPro ) && (
				<a
					className="o-library__upsell"
					href="https://themeisle.com/plugins/otter-blocks/patterns/"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Icon icon={ external } size={ 24 } />

					<div>
						<strong>{ __( 'Premium Designs', 'otter-blocks' ) }</strong>
						<span>{ __( 'Unlock more with Otter Pro', 'otter-blocks' ) }</span>
					</div>
				</a>
			) }
		</aside>
	);
};

export default Sidebar;
