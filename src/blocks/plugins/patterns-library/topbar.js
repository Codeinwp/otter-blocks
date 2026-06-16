/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import {
	__,
	_n,
	sprintf
} from '@wordpress/i18n';

import {
	DropdownMenu,
	MenuGroup,
	MenuItem
} from '@wordpress/components';

import {
	check,
	closeSmall,
	columns as columnsIcon,
	Icon,
	search
} from '@wordpress/icons';

/**
 * Internal dependencies.
 */
import {
	heartIcon,
	heartFilledIcon
} from '../../helpers/icons';

import { tokenLabel } from './smart';

const COLUMN_OPTIONS = [ 2, 3, 4 ];

const Topbar = ({
	query,
	setQuery,
	count,
	favCount,
	favOnly,
	setFavOnly,
	sort,
	setSort,
	columns,
	setColumns,
	tokens,
	onRemoveToken,
	categoryLabels
}) => {
	return (
		<div className="o-library__topbar">
			<div className="o-library__searchwrap">
				<Icon icon={ search } size={ 22 } />

				<input
					className="o-library__search"
					type="search"
					placeholder={ __( 'Try “hero with email signup”…', 'otter-blocks' ) }
					value={ query }
					onChange={ event => setQuery( event.target.value ) }
				/>

				{ Boolean( query ) && (
					<button
						className="o-library__clear"
						aria-label={ __( 'Clear search', 'otter-blocks' ) }
						onClick={ () => setQuery( '' ) }
					>
						<Icon icon={ closeSmall } size={ 18 } />
					</button>
				) }
			</div>

			<div className="o-library__filters">
				<button
					className={ classnames( 'o-library__chip', { 'is-on': favOnly }) }
					onClick={ () => setFavOnly( ! favOnly ) }
				>
					{ ( favOnly ? heartFilledIcon : heartIcon )({ width: 15, height: 15 }) }
					{ __( 'Favorites', 'otter-blocks' ) }
					{ 0 < favCount && <span className="o-library__chip-count">{ favCount }</span> }
				</button>

				<div className="o-library__sep" />

				<select
					className="o-library__sort"
					value={ sort }
					onChange={ event => setSort( event.target.value ) }
					aria-label={ __( 'Sort', 'otter-blocks' ) }
				>
					<option value="featured">{ __( 'Featured', 'otter-blocks' ) }</option>
					<option value="az">{ __( 'Name A–Z', 'otter-blocks' ) }</option>
					<option value="za">{ __( 'Name Z–A', 'otter-blocks' ) }</option>
				</select>

				<DropdownMenu
					icon={ columnsIcon }
					label={ __( 'Columns', 'otter-blocks' ) }
					toggleProps={ { className: 'o-library__colsbtn' } }
					popoverProps={ { placement: 'bottom-end' } }
				>
					{ ({ onClose }) => (
						<MenuGroup label={ __( 'Columns', 'otter-blocks' ) }>
							{ COLUMN_OPTIONS.map( value => (
								<MenuItem
									key={ value }
									icon={ value === columns ? check : null }
									onClick={ () => {
										setColumns( value );
										onClose();
									} }
								>
									{ sprintf(

										// translators: %d is the number of grid columns.
										__( '%d columns', 'otter-blocks' ),
										value
									) }
								</MenuItem>
							) ) }
						</MenuGroup>
					) }
				</DropdownMenu>
			</div>

			<div className="o-library__resultline">
				<span>
					<strong>{ count }</strong>
					{ ' ' + _n( 'template', 'templates', count, 'otter-blocks' ) }
				</span>

				{ Boolean( tokens.length ) && (
					<span className="o-library__understood">
						<span className="o-library__understood-label">{ __( 'matching', 'otter-blocks' ) }</span>

						{ tokens.map( token => (
							<button
								key={ token.kind + token.value }
								className="o-library__token"
								title={ __( 'Remove this filter', 'otter-blocks' ) }
								onClick={ () => onRemoveToken( token ) }
							>
								{ tokenLabel( token, categoryLabels ) }
								<Icon icon={ closeSmall } size={ 16 } />
							</button>
						) ) }
					</span>
				) }
			</div>
		</div>
	);
};

// Loading stand-in for the topbar. Mirrors the search field, filter cluster
// and result line so the controls land in the same place once patterns
// resolve, instead of dropping in above the grid.
export const TopbarSkeleton = () => (
	<div className="o-library__topbar" aria-hidden="true">
		<span
			className="o-library__shimmer"
			style={{ flex: '1 1 280px', maxWidth: 440, height: 38, borderRadius: 9 }}
		/>

		<div className="o-library__filters">
			<span className="o-library__shimmer" style={{ width: 104, height: 34, borderRadius: 8 }} />
			<div className="o-library__sep" />
			<span className="o-library__shimmer" style={{ width: 92, height: 34, borderRadius: 8 }} />
			<span className="o-library__shimmer" style={{ width: 38, height: 34, borderRadius: 8 }} />
		</div>

		<div className="o-library__resultline">
			<span className="o-library__shimmer" style={{ width: 96, height: 13, borderRadius: 4 }} />
		</div>
	</div>
);

// Varied pill widths so the refine row reads as a row of tags rather than a
// uniform bar while it loads.
const TAG_SKELETON_WIDTHS = [ 68, 86, 58, 94, 72, 62, 80 ];

export const TagRowSkeleton = () => (
	<div className="o-library__tagrow" aria-hidden="true">
		<span className="o-library__tagrow-label">{ __( 'Refine', 'otter-blocks' ) }</span>

		{ TAG_SKELETON_WIDTHS.map( ( width, index ) => (
			<span
				key={ index }
				className="o-library__shimmer"
				style={{ width, height: 28, borderRadius: 999 }}
			/>
		) ) }
	</div>
);

export const SmartTagRow = ({
	tags,
	active,
	onToggle
}) => {
	if ( ! tags.length ) {
		return null;
	}

	return (
		<div className="o-library__tagrow">
			<span className="o-library__tagrow-label">{ __( 'Refine', 'otter-blocks' ) }</span>

			{ tags.map( tag => {
				const isOn = active.includes( tag.key );

				// An active tag stays clickable so it can be turned off, even
				// when it currently matches nothing in combination.
				const isDisabled = Boolean( tag.disabled ) && ! isOn;

				return (
					<button
						key={ tag.key }
						className={ classnames( 'o-library__tag', {
							'is-on': isOn,
							'is-tone': Boolean( tag.tone ),
							'is-style': 'meta' === tag.kind && 'style' === tag.group
						}) }
						disabled={ isDisabled }
						onClick={ () => onToggle( tag ) }
					>
						{ tag.tone && (
							<span className={ classnames( 'o-library__tag-dot', `is-${ tag.tone }` ) } />
						) }
						{ tag.label }
						<span className="o-library__tag-count">{ tag.count }</span>
					</button>
				);
			}) }
		</div>
	);
};

export default Topbar;
