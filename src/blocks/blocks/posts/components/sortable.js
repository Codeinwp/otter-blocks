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
	toLower,
	isEmpty
} from 'lodash';

import {
	__,
	sprintf
} from '@wordpress/i18n';

import {
	Button,
	TextControl,
	SelectControl,
	ToggleControl,
	RangeControl,
	BaseControl,
	ExternalLink
} from '@wordpress/components';

import {
	Fragment,
	useState,
	useContext
} from '@wordpress/element';

import { useSelect } from '@wordpress/data';

import ResponsiveControl from '../../../components/responsive-control';
import { CustomMetasContext } from '../edit';

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
	const customMeta = attributes?.customMetas?.filter( ({id}) =>  id === template )?.pop();

	const templateLookUp = {
		image: attributes.displayFeaturedImage,
		category: attributes.displayCategory,
		title: attributes.displayTitle,
		meta: attributes.displayMeta,
		description: attributes.displayDescription
	};

	const toggleField = fieldName => {
		const field = fieldMapping[fieldName] || fieldName;
		setAttributes({ [field]: ! attributes[field] });
	};

	const getView = useSelect( select => {
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' );
		return __experimentalGetPreviewDeviceType();
	}, []);

	const getTitleFontSize = () => {
		switch ( getView ) {
		case 'Desktop':
			return attributes.customTitleFontSize;
		case 'Tablet':
			return attributes.customTitleFontSizeTablet;
		case 'Mobile':
			return attributes.customTitleFontSizeMobile;
		default:
			return undefined;
		}
	};

	const changeTitleFontSize = value => {
		if ( 'Desktop' === getView ) {
			setAttributes({ customTitleFontSize: value });
		} else if ( 'Tablet' === getView ) {
			setAttributes({ customTitleFontSizeTablet: value });
		} else if ( 'Mobile' === getView ) {
			setAttributes({ customTitleFontSizeMobile: value });
		}
	};

	const getDescriptionFontSize = () => {
		switch ( getView ) {
		case 'Desktop':
			return attributes.customDescriptionFontSize;
		case 'Tablet':
			return attributes.customDescriptionFontSizeTablet;
		case 'Mobile':
			return attributes.customDescriptionFontSizeMobile;
		default:
			return undefined;
		}
	};

	const changeDescriptionFontSize = value => {
		if ( 'Desktop' === getView ) {
			setAttributes({ customDescriptionFontSize: value });
		} else if ( 'Tablet' === getView ) {
			setAttributes({ customDescriptionFontSizeTablet: value });
		} else if ( 'Mobile' === getView ) {
			setAttributes({ customDescriptionFontSizeMobile: value });
		}
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

	const deleteCustomField = () => {
		setAttributes({
			template: attributes.template?.filter( template => template !== customMeta?.id ),
			customMetas: attributes.customMetas?.filter( currentMeta =>
				currentMeta?.id !== customMeta?.id )
		});
	};

	const { acfData, acfFieldDict, ALLOWED_ACF_TYPES } = useContext( CustomMetasContext );

	const label = ! isCustomMeta ? startCase( toLower( template ) ) :  startCase( toLower( acfFieldDict[customMeta.field]?.label || 'Custom Type' ) );
	const canEdit = templateLookUp[template] || customMeta?.display;
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

				{ canEdit && 'category' !== template && (
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

			{ canEdit && 'category' !== template && (
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
								label={ __( 'Crop image to fit', 'otter-blocks' ) }
								checked={ attributes.cropImage }
								onChange={ cropImage => setAttributes({ cropImage }) }
							/>

							<ToggleControl
								label={ __( 'Display box shadow', 'otter-blocks' ) }
								checked={ attributes.imageBoxShadow }
								onChange={ imageBoxShadow => setAttributes({ imageBoxShadow }) }
							/>

							<RangeControl
								label={ __( 'Border Radius', 'otter-blocks' ) }
								value={ attributes.borderRadius }
								onChange={ borderRadius => setAttributes({ borderRadius }) }
								min={ 0 }
								max={ 50 }
								allowReset
							/>

							<RangeControl
								label={ __( 'Image Width', 'otter-blocks' ) }
								value={ attributes.imageWidth }
								onChange={ imageWidth => setAttributes({ imageWidth }) }
								min={ 0 }
								max={ 500 }
								allowReset
							/>
						</Fragment>
					) }

					{ ( 'title' === template ) && (
						<Fragment >
							<SelectControl
								label={ __( 'Title Tag', 'otter-blocks' ) }
								value={ attributes.titleTag || 'h5' }
								options={ [
									{ label: __( 'H1', 'otter-blocks' ), value: 'h1' },
									{ label: __( 'H2', 'otter-blocks' ), value: 'h2' },
									{ label: __( 'H3', 'otter-blocks' ), value: 'h3' },
									{ label: __( 'H4', 'otter-blocks' ), value: 'h4' },
									{ label: __( 'H5', 'otter-blocks' ), value: 'h5' },
									{ label: __( 'H6', 'otter-blocks' ), value: 'h6' }
								] }
								onChange={ titleTag => setAttributes({ titleTag }) }
							/>

							<ResponsiveControl
								label={ __( 'Font size', 'otter-blocks' ) }
							>
								<RangeControl
									value={ getTitleFontSize() }
									onChange={ changeTitleFontSize }
									min={ 0 }
									max={ 50 }
									allowReset
								/>
							</ResponsiveControl>
						</Fragment>
					) }

					{ ( 'meta' === template ) && (
						<Fragment >
							<ToggleControl
								label={ __( 'Display post date', 'otter-blocks' ) }
								checked={ attributes.displayDate }
								onChange={ displayDate => setAttributes({ displayDate }) }
							/>

							<ToggleControl
								label={ __( 'Display author', 'otter-blocks' ) }
								checked={ attributes.displayAuthor }
								onChange={ displayAuthor => setAttributes({ displayAuthor }) }
							/>

							<ToggleControl
								label={ __( 'Display comments', 'otter-blocks' ) }
								checked={ attributes.displayComments }
								onChange={ displayComments => setAttributes({ displayComments }) }
							/>

							<ToggleControl
								label={ __( 'Display category', 'otter-blocks' ) }
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
								value={ attributes.excerptLimit }
								onChange={ excerptLimit => setAttributes({ excerptLimit }) }
							/>

							<ToggleControl
								label={ __( 'Display read more link', 'otter-blocks' ) }
								checked={ attributes.displayReadMoreLink }
								onChange={ displayReadMoreLink => setAttributes({ displayReadMoreLink }) }
							/>

							<ResponsiveControl
								label={ __( 'Font size', 'otter-blocks' ) }
							>
								<RangeControl
									value={ getDescriptionFontSize() }
									onChange={ changeDescriptionFontSize }
									min={ 0 }
									max={ 50 }
									allowReset
								/>
							</ResponsiveControl>
						</Fragment>
					) }

					{ isCustomMeta && customMeta && (
						<Fragment>
							{
								! isEmpty( acfData ) && (
									<BaseControl
										label={ __( 'Fields', 'otter-blocks' ) }
									>
										<select
											value={  acfFieldDict[customMeta.field] ? customMeta.field : 'none' }
											onChange={ event => {
												setAttributesCustomMeta({ field: event.target.value  });
											} }
											className="components-select-control__input"
										>
											<option value="none">{ __( 'Select a field', 'otter-blocks' ) }</option>

											{
												acfData.map( group => {
													return (
														<optgroup
															label={ group?.data?.title }
														>
															{
																group?.fields
																	?.filter( ({ key, label, type }) => key && label &&  ALLOWED_ACF_TYPES.includes( type ) )
																	.map( ({ key, label }) => (
																		<option value={key}>
																			{ label }
																		</option>
																	) )
															}
														</optgroup>
													);
												})
											}
										</select>
									</BaseControl>

								)
							}

							{
								( ! isEmpty( acfFieldDict ) ) && acfFieldDict[customMeta.field] && (
									<Fragment>
										{
											( acfFieldDict[customMeta.field]['default_value']) && (
												<TextControl
													label={ __( 'Default Value', 'otter-blocks' ) }
													value={ acfFieldDict[customMeta.field]['default_value']  }
													disabled
												/>
											)
										}

										{
											( acfFieldDict[customMeta.field].prepend ) && (
												<TextControl
													label={ __( 'Before', 'otter-blocks' ) }
													value={  acfFieldDict[customMeta.field].prepend }
													disabled
												/>
											)
										}

										{
											( acfFieldDict[customMeta.field].append  ) && (
												<TextControl
													label={ __( 'After', 'otter-blocks' ) }
													value={ acfFieldDict[customMeta.field].append }
													disabled
												/>
											)
										}

									</Fragment>
								)
							}

							{
								acfFieldDict[customMeta.field]?.urlLocation && (
									<Fragment>
										<ExternalLink
											href={acfFieldDict[customMeta.field]?.urlLocation}
											target='_blank'
										>
											{__( 'Edit value in Dashboard.', 'otter-blocks' )}
										</ExternalLink>
										<br/>
									</Fragment>

								)
							}

							{
								isEmpty( acfData ) ? (
									<ExternalLink
										href={`${themeisleGutenberg?.rootUrl || ''}/wp-admin/edit.php?post_type=acf-field-group`}
										target='_blank'
									>
										{__( 'There are no ACF fields. Please add some fields using the Dashboard.', 'otter-blocks' )}
									</ExternalLink>
								) : ! acfFieldDict[customMeta.field] &&  (
									__( 'The selected field does not longer exists. Please select another field.', 'otter-blocks' )
								)
							}


							<Button
								onClick={deleteCustomField}
								variant="secondary"
								isSecondary
								isDestructive
								className="otter-conditions__add"
							>
								{ __( 'Delete', 'otter-blocks' ) }
							</Button>


						</Fragment>
					) }
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
					if ( template?.startsWith( 'custom_' ) && window?.acf === undefined ) {
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
