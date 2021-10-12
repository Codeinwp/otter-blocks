/** @jsx jsx */

/**
 * External dependencies
 */
import {
	css,
	jsx
} from '@emotion/react';
import classnames from 'classnames';
import hexToRgba from 'hex-rgba';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { RichText } from '@wordpress/block-editor';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import defaultAttributes from './attributes.js';
import Controls from './controls.js';
import Inspector from './inspector.js';
import themeIsleIcons from './../../../helpers/themeisle-icons';
import { blockInit } from '../../../helpers/block-utility.js';

const Edit = ({
	attributes,
	setAttributes,
	className,
	isSelected,
	clientId
}) => {
	const {
		hasParent,
		parentAttributes,
		isLastChild
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
			isLastChild: parentBlock ? clientId === parentBlock.innerBlocks[ parentBlock.innerBlocks.length - 1 ].clientId : true
		};
	}, []);

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, []);

	let boxShadowStyle = {};

	let buttonStyle = {};

	let buttonStyleParent = {};

	if ( attributes.boxShadow ) {
		boxShadowStyle = {
			boxShadow: `${ attributes.boxShadowHorizontal }px ${ attributes.boxShadowVertical }px ${ attributes.boxShadowBlur }px ${ attributes.boxShadowSpread }px ${  hexToRgba( ( attributes.boxShadowColor ? attributes.boxShadowColor : '#000000' ), attributes.boxShadowColorOpacity ) }`
		};
	}

	if ( hasParent ) {
		buttonStyleParent = {
			marginRight: ! isLastChild && `${ parentAttributes.spacing }px`
		};

		buttonStyle = {
			paddingTop: `${ parentAttributes.paddingTopBottom }px`,
			paddingBottom: `${ parentAttributes.paddingTopBottom }px`,
			paddingLeft: `${ parentAttributes.paddingLeftRight }px`,
			paddingRight: `${ parentAttributes.paddingLeftRight }px`,
			fontSize: parentAttributes.fontSize && `${ parentAttributes.fontSize }px`,
			fontFamily: parentAttributes.fontFamily,
			fontWeight: parentAttributes.fontVariant,
			fontStyle: parentAttributes.fontStyle,
			textTransform: parentAttributes.textTransform,
			lineHeight: parentAttributes.lineHeight && `${ parentAttributes.lineHeight }px`
		};
	}

	const styles = {
		color: attributes.color,
		background: attributes.background || attributes.backgroundGradient,
		border: `${ attributes.borderSize }px solid ${ attributes.border }`,
		borderRadius: attributes.borderRadius,
		...boxShadowStyle,
		...buttonStyle
	};

	const hoverStyles = css`
		&:hover {
			color: ${ attributes.hoverColor } !important;
			background: ${ attributes.hoverBackground || attributes.hoverBackgroundGradient } !important;
			border-color: ${ attributes.hoverBorder } !important;
			${ attributes.boxShadow && `box-shadow: ${ attributes.hoverBoxShadowHorizontal }px ${ attributes.hoverBoxShadowVertical }px ${ attributes.hoverBoxShadowBlur }px ${ attributes.hoverBoxShadowSpread }px ${  hexToRgba( ( attributes.hoverBoxShadowColor ? attributes.hoverBoxShadowColor : '#000000' ), attributes.hoverBoxShadowColorOpacity ) } !important;` }
		}

		&:hover svg {
			fill: ${ attributes.hoverColor } !important;
		}
	`;

	const iconStyles = {
		fill: attributes.color,
		width: parentAttributes.fontSize && `${ parentAttributes.fontSize }px`
	};

	const Icon = themeIsleIcons.icons[ attributes.icon ];

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

			<div
				id={ attributes.id }
				className={ classnames(
					className,
					'wp-block-button'
				) }
				style={ buttonStyleParent }
			>
				{ 'none' !== attributes.iconType ? (
					<div
						className="wp-block-button__link"
						style={ styles }
						css={ hoverStyles }
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
						css={ hoverStyles }
					/>
				) }
			</div>
		</Fragment>
	);
};

export default Edit;
