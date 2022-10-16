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
	__,
	sprintf
} from '@wordpress/i18n';

import {
	startCase,
	toLower
} from 'lodash';

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

import { applyFilters } from '@wordpress/hooks';

const DragHandle = SortableHandle( () => {
	return (
		<div className="o-sortable-handle" tabIndex="0">
			<span></span>
		</div>
	);
});

const fieldMapping = {
	image: 'displayFeaturedImage',
	category: 'displayCategory',
	title: 'displayTitle',
	meta: 'displayMeta',
	description: 'displayDescription'
};

export const SortableItem = ({
	attributes,
	setAttributes,
	template,
	disabled
}) => {
	const [ isOpen, setOpen ] = useState( false );

	const isCustomMeta = template?.startsWith( 'custom_' );
	const customMeta = attributes?.customMetas?.filter( ({ id }) =>  id === template )?.pop();

	const templateLookUp = {
		image: attributes.displayFeaturedImage,
		category: attributes.displayCategory,
		title: attributes.displayTitle,
		meta: attributes.displayMeta,
		description: attributes.displayDescription
	};

	const toggleField = fieldName => {
		const field = fieldMapping[ fieldName ] || fieldName;
		setAttributes({ [field]: ! attributes[ field ] });
	};

	const setAttributesCustomMeta = attr => {
		const newMeta = { ...customMeta, ...attr };
		setAttributes({
			customMetas: attributes.customMetas.map( currentMeta => {
				if ( currentMeta.id === customMeta.id ) {
					return newMeta;
				}
				return currentMeta;
			})
		});
	};

	const label = ! isCustomMeta ? startCase( toLower( template ) ) : applyFilters( 'otter.postsBlock.panelLabel', '', customMeta );
	const canEdit = templateLookUp[ template ] || customMeta?.display;
	const icon = canEdit ? 'visibility' : 'hidden';

	/* translators: %s Label */
	let message = sprintf( __( 'Display %s', 'otter-blocks' ), label );
	if ( canEdit ) {

		/* translators: %s Label */
		message = sprintf( __( 'Hide %s', 'otter-blocks' ), label );
	}

	return (
		<div
			className={ classnames(
				'o-sortable-item-area',
				`o-sortable-item-area-${ template }`
			) }
		>
			<div
				className={ classnames(
					'o-sortable-item',
					{
						'disabled': disabled,
						'hidden': ! canEdit,
						'editable': canEdit
					}
				) }
			>
				{ ! disabled && <DragHandle /> }

				<div className="o-sortable-label">
					{ label }
				</div>

				{ canEdit && ! [ 'category', 'title' ].includes( template ) && (
					<Button
						icon={ isOpen ? 'arrow-up-alt2' : 'arrow-down-alt2' }
						label={ isOpen ? __( 'Close Settings', 'otter-blocks' ) : __( 'Open Settings', 'otter-blocks' ) }
						showTooltip={ true }
						className="o-sortable-button"
						onClick={ () => setOpen( ! isOpen ) }
					/>
				) }

				<Button
					icon={ icon }
					label={ message }
					showTooltip={ true }
					className="o-sortable-button"
					onClick={ () => {
						if ( isCustomMeta ) {
							setAttributesCustomMeta({ display: ! customMeta.display });
						} else {
							toggleField( template );
						}
						setOpen( false );
					} }
				/>
			</div>

			{ canEdit && ! [ 'category', 'title' ].includes( template ) && (
				<div
					className={ classnames(
						'o-sortable-control-area',
						{ 'opened': isOpen && canEdit }
					) }
				>
					{ ( 'image' === template ) && (
						<Fragment >
							<SelectControl
								label={ __( 'Image Size', 'otter-blocks' ) }
								value={ attributes.imageSize }
								options={ window.themeisleGutenberg.imageSizes.map( size => ({
									label: startCase( toLower( size ) ),
									value: size
								}) ) }
								onChange={ imageSize => setAttributes({ imageSize }) }
							/>

							<ToggleControl
								label={ __( 'Crop Image to Fit', 'otter-blocks' ) }
								checked={ attributes.cropImage }
								onChange={ cropImage => setAttributes({ cropImage }) }
							/>
						</Fragment>
					) }

					{ ( 'meta' === template ) && (
						<Fragment >
							<ToggleControl
								label={ __( 'Display Post Date', 'otter-blocks' ) }
								checked={ attributes.displayDate }
								onChange={ displayDate => setAttributes({ displayDate }) }
							/>

							<ToggleControl
								label={ __( 'Display Author', 'otter-blocks' ) }
								checked={ attributes.displayAuthor }
								onChange={ displayAuthor => setAttributes({ displayAuthor }) }
							/>

							<ToggleControl
								label={ __( 'Display Comments', 'otter-blocks' ) }
								checked={ attributes.displayComments }
								onChange={ displayComments => setAttributes({ displayComments }) }
							/>

							<ToggleControl
								label={ __( 'Display Category', 'otter-blocks' ) }
								checked={ attributes.displayPostCategory }
								onChange={ displayPostCategory => setAttributes({ displayPostCategory }) }
							/>
						</Fragment>
					) }

					{ ( 'description' === template ) && (
						<Fragment >
							<TextControl
								label={ __( 'Excerpt Limit', 'otter-blocks' ) }
								type="number"
								value={ attributes.excerptLength }
								onChange={ value => setAttributes({ excerptLength: Number( value ) }) }
							/>

							<ToggleControl
								label={ __( 'Display Read More Link', 'otter-blocks' ) }
								checked={ attributes.displayReadMoreLink }
								onChange={ displayReadMoreLink => setAttributes({ displayReadMoreLink }) }
							/>
						</Fragment>
					) }

					{ applyFilters( 'otter.postsBlock.controls', '', attributes, setAttributes, isCustomMeta, customMeta, setAttributesCustomMeta ) }
				</div>
			) }
		</div>
	);
};

const SortableItemContainer = SortableElement( ({
	attributes,
	setAttributes,
	template,
	disabled
}) => {
	return (
		<SortableItem
			attributes={ attributes }
			setAttributes={ setAttributes }
			template={ template }
			disabled={ disabled }
		/>
	);
});

export const SortableList = SortableContainer( ({
	attributes,
	setAttributes
}) => {
	return (
		<div>
			{ attributes?.template
				?.filter( template => {
					if ( template?.startsWith( 'custom_' ) && ( window?.acf === undefined || ( ! window.themeisleGutenberg?.hasPro ) ) ) {
						return false;
					}
					return true;
				})
				.map( ( template, index ) => (
					<SortableItemContainer
						key={ `item-${ template }` }
						index={ index }
						attributes={ attributes }
						setAttributes={ setAttributes }
						template={ template }
					/>
				) ) }
		</div>
	);
});
