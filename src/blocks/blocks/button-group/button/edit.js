
/**
 * External dependencies
 */

import classnames from 'classnames';
import hexToRgba from 'hex-rgba';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import parentMetadata from '../group/block.json';
import Controls from './controls.js';
import Inspector from './inspector.js';
import themeIsleIcons from './../../../helpers/themeisle-icons';
import {
	blockInit,
	buildGetSyncValue,
	useCSSNode
} from '../../../helpers/block-utility.js';
import { boxToCSS, objectOrNumberAsBox, _px } from '../../../helpers/helper-functions';

const { attributes: defaultParentAttributes } = parentMetadata;
const { attributes: defaultAttributes } = metadata;

/**
 * Button component
 * @param {import('./types').ButtonGroupButtonProps} props
 * @returns
 */
const Edit = ( props ) => {

	const {
		attributes,
		setAttributes,
		isSelected,
		clientId,
		name
	} = props;

	const {
		hasParent,
		parentAttributes,
		getSyncValueParent
	} = useSelect( select => {
		const {
			getBlock,
			getBlockRootClientId
		} = select( 'core/block-editor' );

		const parentClientId = getBlockRootClientId( clientId );
		const parentBlock = getBlock( parentClientId );

		return {
			hasParent: parentBlock ? true : false,
			parentAttributes: parentBlock ? parentBlock.attributes : {},
			getSyncValueParent: buildGetSyncValue( parentBlock?.name, parentBlock?.attributes, defaultParentAttributes )
		};
	}, []);

	const getSyncValue = buildGetSyncValue( name, attributes, defaultAttributes );

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, []);

	let boxShadowStyle = {};

	let buttonStyle = {};

	if ( attributes.boxShadow ) {
		boxShadowStyle = {
			boxShadow: `${ getSyncValue( 'boxShadowHorizontal' ) }px ${ getSyncValue( 'boxShadowVertical' ) }px ${ getSyncValue( 'boxShadowBlur' ) }px ${ getSyncValue( 'boxShadowSpread' ) }px ${ hexToRgba( ( getSyncValue( 'boxShadowColor' ) ? getSyncValue( 'boxShadowColor' ) : '#000000' ), getSyncValue( 'boxShadowColorOpacity' ) ) }`
		};
	}

	if ( hasParent ) {

		buttonStyle = {
			fontFamily: getSyncValueParent( 'fontFamily' ),
			fontWeight: getSyncValueParent( 'fontVariant' ),
			fontStyle: getSyncValueParent( 'fontStyle' ),
			textTransform: getSyncValueParent( 'textTransform' ),
			lineHeight: getSyncValueParent( 'lineHeight' ) && `${ getSyncValueParent( 'lineHeight' ) }px`
		};
	}

	const getCSSBasedOnStyle = () => {
		if ( attributes?.className?.includes( 'is-style-plain' ) ) {
			return {
				color: getSyncValue( 'color' )
			};
		}
		if ( attributes?.className?.includes( 'is-style-outline' ) ) {
			return {
				color: getSyncValue( 'color' ),
				borderWidth: boxToCSS( objectOrNumberAsBox( getSyncValue( 'borderSize' ) ) ),
				borderColor: getSyncValue( 'border' ),
				borderRadius: boxToCSS( objectOrNumberAsBox( getSyncValue( 'borderRadius' ) ) ),
				...boxShadowStyle
			};
		}

		return {
			color: getSyncValue( 'color' ),
			background: getSyncValue( 'background' ) || getSyncValue( 'backgroundGradient' ),
			borderWidth: boxToCSS( objectOrNumberAsBox( getSyncValue( 'borderSize' ) ) ),
			borderColor: getSyncValue( 'border' ),
			borderRadius: boxToCSS( objectOrNumberAsBox( getSyncValue( 'borderRadius' ) ) ),
			...boxShadowStyle
		};
	};

	const styles = {
		...getCSSBasedOnStyle(),
		...buttonStyle
	};

	console.log( styles );

	const iconStyles = {
		fill: getSyncValue( 'color' ),
		width: _px( getSyncValueParent( 'fontSize' ) )
	};

	const Icon = themeIsleIcons.icons[ attributes.icon ];

	const [ cssNodeName, setCSSNode ] = useCSSNode();
	useEffect( () => {
		setCSSNode([
			`.wp-block-button__link:hover {
				color: ${ getSyncValue( 'hoverColor' ) } !important;
				background: ${ getSyncValue( 'hoverBackground' ) || getSyncValue( 'hoverBackgroundGradient' ) } !important;
				border-color: ${ getSyncValue( 'hoverBorder' ) } !important;
				${ getSyncValue( 'boxShadow' ) && `box-shadow: ${ getSyncValue( 'hoverBoxShadowHorizontal' ) }px ${ getSyncValue( 'hoverBoxShadowVertical' ) }px ${ getSyncValue( 'hoverBoxShadowBlur' ) }px ${ getSyncValue( 'attributes.hoverBoxShadowSpread' ) }px ${ hexToRgba( ( getSyncValue( 'hoverBoxShadowColor' ) ? getSyncValue( 'hoverBoxShadowColor' ) : '#000000' ), getSyncValue( 'hoverBoxShadowColorOpacity' ) ) } !important;` }
			}`,
			`.wp-block-button__link:hover svg {
				fill: ${ getSyncValue( 'attributes.hoverColor' ) } !important;
			}`
		]);
	}, [
		attributes.hoverColor,
		attributes.hoverBackground, attributes.hoverBackgroundGradient,
		attributes.hoverBorder, attributes.hoverColor, attributes.boxShadow,
		attributes.hoverBoxShadowHorizontal, attributes.hoverBoxShadowBlur,
		attributes.hoverBoxShadowSpread, attributes.hoverBoxShadowColor,
		attributes.hoverBoxShadowColorOpacity
	]);

	const blockProps = useBlockProps({
		id: attributes.id,
		className: classnames( 'wp-block-button', cssNodeName )
	});

	return (
		<Fragment>
			<Controls
				attributes={ attributes }
				setAttributes={ setAttributes }
				isSelected={ isSelected }
			/>

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				{ 'none' !== attributes.iconType ? (
					<div
						className="wp-block-button__link"
						style={ styles }
					>
						{ ( 'left' === attributes.iconType || 'only' === attributes.iconType ) && (
							'themeisle-icons' === attributes.library && attributes.icon ? (
								<Icon
									className={ classnames(
										{ 'margin-right': 'left' === attributes.iconType }
									) }
									style={ iconStyles }
								/>
							) : (
								<i
									className={ classnames(
										attributes.prefix,
										'fa-fw',
										`fa-${ attributes.icon }`,
										{ 'margin-right': 'left' === attributes.iconType }
									) }
								>
								</i>
							)
						) }

						{ 'only' !== attributes.iconType && (
							<RichText
								placeholder={ __( 'Add text…', 'otter-blocks' ) }
								value={ attributes.text }
								onChange={ value => setAttributes({ text: value }) }
								tagName="div"
								withoutInteractiveFormatting
							/>
						) }

						{ 'right' === attributes.iconType && (
							'themeisle-icons' === attributes.library && attributes.icon ? (
								<Icon
									className="margin-left"
									style={ iconStyles }
								/>
							) : (
								<i className={ `${ attributes.prefix } fa-fw fa-${ attributes.icon } margin-left` }></i>
							)
						) }
					</div>
				) : (
					<RichText
						placeholder={ __( 'Add text…', 'otter-blocks' ) }
						value={ attributes.text }
						onChange={ value => setAttributes({ text: value }) }
						tagName="div"
						withoutInteractiveFormatting
						className="wp-block-button__link"
						style={ styles }
					/>
				) }
			</div>
		</Fragment>
	);
};

export default Edit;
