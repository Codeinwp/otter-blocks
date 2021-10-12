/**
 * External dependencies
 */
import classnames from 'classnames';

import {
	SortableContainer,
	SortableElement,
	SortableHandle
} from 'react-sortable-hoc';

/**
 * WordPress dependencies
 */
import {
	startCase,
	toLower
} from 'lodash';

import { __ } from '@wordpress/i18n';

import {
	Button,
	TextControl,
	SelectControl,
	ToggleControl
} from '@wordpress/components';

import {
	Fragment,
	useState
} from '@wordpress/element';

const DragHandle = SortableHandle( () => {
	return (
		<div className="otter-blocks-sortable-handle" tabIndex="0">
			<span></span>
		</div>
	);
});

export const SortableItem = ({
	value,
	disabled,
	getFields,
	toggleFields,
	imageSize,
	titleTag,
	excerptLimit
}) => {
	const [ isOpen, setOpen ] = useState( false );

	const label = startCase( toLower( value ) );
	let icon = 'hidden';
	let message = __( `Display ${ label }`, 'otter-blocks' );

	if ( getFields( value ) ) {
		icon = 'visibility';
		message = __( `Hide ${ label }`, 'otter-blocks' );
	}

	let edit;

	switch ( value ) {
	case 'image':
		edit = true;
		break;
	case 'title':
		edit = true;
		break;
	case 'meta':
		edit = true;
		break;
	case 'description':
		edit = true;
		break;
	default:
		edit = false;
		break;
	}

	return (
		<div
			className={ classnames(
				'otter-blocks-sortable-item-area',
				`otter-blocks-sortable-item-area-${ value }`
			) }
		>
			<div
				className={ classnames(
					'otter-blocks-sortable-item',
					{
						'disabled': disabled,
						'hidden': ! getFields( value ),
						'editable': edit
					}
				) }
			>
				{ ! disabled && <DragHandle /> }

				<div className="otter-blocks-sortable-label">
					{ label }
				</div>

				{ edit && (
					<Button
						icon={ isOpen ? 'arrow-up-alt2' : 'arrow-down-alt2' }
						label={ isOpen ? __( 'Close Settings', 'otter-blocks' ) : __( 'Open Settings', 'otter-blocks' ) }
						showTooltip={ true }
						className="otter-blocks-sortable-button"
						onClick={ () => setOpen( ! isOpen ) }
					/>
				) }

				<Button
					icon={ icon }
					label={ message }
					showTooltip={ true }
					className="otter-blocks-sortable-button"
					onClick={ () => {
						toggleFields( value );
						setOpen( false );
					} }
				/>
			</div>

			{ edit && (
				<div
					className={ classnames(
						'otter-blocks-sortable-control-area',
						{ 'opened': isOpen && getFields( value ) }
					) }
				>
					{ ( 'image' === value ) && (
						<Fragment>
							<SelectControl
								label={ __( 'Image Size', 'otter-blocks' ) }
								value={ imageSize.value }
								options={ window.themeisleGutenberg.imageSizes.map( value => ({
									label: startCase( toLower( value ) ),
									value
								}) ) }
								onChange={ imageSize.onChange }
							/>

							<ToggleControl
								label={ __( 'Display Box Shadow?', 'otter-blocks' ) }
								checked={ getFields( 'imageBoxShadow', 'otter-blocks' ) }
								onChange={ () => toggleFields( 'imageBoxShadow' ) }
							/>
						</Fragment>
					) }

					{ ( 'title' === value ) && (
						<SelectControl
							label={ __( 'Title Tag', 'otter-blocks' ) }
							value={ titleTag.value || 'h5' }
							options={ [
								{ label: __( 'H1', 'otter-blocks' ), value: 'h1' },
								{ label: __( 'H2', 'otter-blocks' ), value: 'h2' },
								{ label: __( 'H3', 'otter-blocks' ), value: 'h3' },
								{ label: __( 'H4', 'otter-blocks' ), value: 'h4' },
								{ label: __( 'H5', 'otter-blocks' ), value: 'h5' },
								{ label: __( 'H6', 'otter-blocks' ), value: 'h6' }
							] }
							onChange={ titleTag.onChange }
						/>
					) }

					{ ( 'description' === value ) && (
						<TextControl
							label={ __( 'Excerpt Limit', 'otter-blocks' ) }
							type="number"
							value={ excerptLimit.value }
							onChange={ excerptLimit.onChange }
						/>
					) }

					{ ( 'meta' === value ) && (
						<Fragment>
							<ToggleControl
								label={ __( 'Display Date?', 'otter-blocks' ) }
								checked={ getFields( 'date' ) }
								onChange={ () => toggleFields( 'date' ) }
							/>

							<ToggleControl
								label={ __( 'Display Author?', 'otter-blocks' ) }
								checked={ getFields( 'author' ) }
								onChange={ () => toggleFields( 'author' ) }
							/>
						</Fragment>
					) }
				</div>
			) }
		</div>
	);
};

const SortableItemContainer = SortableElement( ({
	value,
	disabled,
	getFields,
	toggleFields,
	titleTag,
	excerptLimit
}) => {
	return (
		<SortableItem
			value={ value }
			disabled={ disabled }
			getFields={ getFields }
			toggleFields={ toggleFields }
			titleTag={ titleTag }
			excerptLimit={ excerptLimit }
		/>
	);
});

export const SortableList = SortableContainer( ({
	template,
	getFields,
	toggleFields,
	titleTag,
	excerptLimit
}) => {
	return (
		<div>
			{ template.map( ( value, index ) => (
				<SortableItemContainer
					key={`item-${ value }`}
					index={ index }
					value={ value }
					getFields={ getFields }
					toggleFields={ toggleFields }
					titleTag={ titleTag }
					excerptLimit={ excerptLimit }
				/>
			) ) }
		</div>
	);
});
