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

import {
	__,
	sprintf
} from '@wordpress/i18n';

import {
	Button,
	TextControl,
	SelectControl,
	ToggleControl,
	RangeControl
} from '@wordpress/components';

import {
	Fragment,
	useState,
	useEffect
} from '@wordpress/element';

const DragHandle = SortableHandle( () => {
	return (
		<div className="otter-blocks-sortable-handle" tabIndex="0">
			<span></span>
		</div>
	);
});


export const SortableItem = ({
	attributes,
	setAttributes,
	value,
	disabled
}) => {
	const [ isOpen, setOpen ] = useState( false );
	const [ templateLookUp, setTemplateLookUp ] = useState({
		image: attributes.displayFeaturedImage,
		category: attributes.displayCategory,
		title: attributes.displayTitle,
		meta: attributes.displayMeta,
		description: attributes.displayDescription
	});

	useEffect( () => {
		setTemplateLookUp({
			image: attributes.displayFeaturedImage,
			category: attributes.displayCategory,
			title: attributes.displayTitle,
			meta: attributes.displayMeta,
			description: attributes.displayDescription
		});
	}, [ attributes.displayCategory, attributes.displayTitle, attributes.displayMeta, attributes.displayDescription ]);

	const toggleField = fieldName => {
		setAttributes({ [fieldName]: ! attributes[fieldName] });
	};

	const FeaturedImage = () => {
		return (
			<Fragment>
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
			</Fragment>
		);
	};

	const PostTitle = () => {
		return (
			<Fragment>
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
				<ToggleControl
					label={ __( 'Enable custom font size', 'otter-blocks' ) }
					checked={ attributes.enableCustomFontSize }
					onChange={ enableCustomFontSize => setAttributes({ enableCustomFontSize, customFontSize: undefined }) }
				/>
				<RangeControl
					label={ __( 'Font size', 'otter-blocks' ) }
					value={ attributes.customFontSize }
					onChange={ customFontSize => setAttributes({ customFontSize }) }
					min={ 0 }
					max={ 50 }
				/>
			</Fragment>
		);
	};

	const PostMeta = () => {
		return (
			<Fragment>
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
		);
	};

	const Excerpt = () => {
		return (
			<Fragment>
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
			</Fragment>
		);
	};


	const label = startCase( toLower( value ) );
	const edit = templateLookUp[value];
	const icon = edit ? 'visibility' : 'hidden';

	/* translators: %s Label */
	let message = sprintf( __( 'Display %s', 'otter-blocks' ), label );
	if ( edit ) {

		/* translators: %s Label */
		message = sprintf( __( 'Hide %s', 'otter-blocks' ), label );
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
						'hidden': ! templateLookUp[value],
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
						toggleField( value );
						setOpen( false );
					} }
				/>
			</div>

			{ edit && (
				<div
					className={ classnames(
						'otter-blocks-sortable-control-area',
						{ 'opened': isOpen && templateLookUp[value] }
					) }
				>
					{ ( 'image' === value ) && <FeaturedImage /> }
					{ ( 'title' === value ) && <PostTitle /> }
					{ ( 'meta' === value ) && <PostMeta /> }
					{ ( 'description' === value ) && <Excerpt /> }
				</div>
			) }
		</div>
	);
};

const SortableItemContainer = SortableElement( ({
	attributes,
	setAttributes,
	value,
	disabled
}) => {
	return (
		<SortableItem
			attributes={ attributes }
			setAttributes={ setAttributes }
			value={ value }
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
			{ attributes?.template?.map( ( value, index ) => (
				<SortableItemContainer
					key={ `item-${ value }` }
					index={ index }
					attributes={ attributes }
					setAttributes={ setAttributes }
					value={ value }
				/>
			) ) }
		</div>
	);
});
