/** @jsx jsx */

/**
 * External dependencies
 */
import {
	css,
	jsx
} from '@emotion/react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	InnerBlocks,
	RichText
} from '@wordpress/block-editor';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import { blockInit } from '../../helpers/block-utility.js';
import defaultAttributes from './attributes.js';
import Controls from './controls.js';
import Inspector from './inspector.js';

const Edit = ({
	attributes,
	setAttributes,
	className,
	isSelected,
	clientId
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const style = {
		container: {
			backgroundColor: attributes.backgroundColor,
			borderRadius: attributes.borderRadius + 'px',
			border: attributes.borderWidth && `${ attributes.borderWidth }px solid ${ attributes.borderColor || '#000000' }`
		},
		title: {
			textAlign: attributes.titleAlignment,
			fontSize: attributes.titleFontSize + 'px',
			color: attributes.titleColor
		}
	};

	const contentCSS = css`
		.otter-business-hour__container .otter-business-hour__content .wp-block-themeisle-blocks-business-hours-item {
			font-size: ${ attributes.itemsFontSize }px;
			padding-top: ${ attributes.gap }px;
			padding-bottom: ${ attributes.gap }px;
		}

		.otter-business-hour__container .otter-business-hour__content .block-editor-block-list__block:last-child .wp-block-themeisle-blocks-business-hours-item {
			border-radius: 0 0 ${ attributes.borderRadius || 0 }px ${ attributes.borderRadius || 0 }px;
		}
	`;

	return (
		<Fragment>
			<Controls
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div
				className={ className }
				id={ attributes.id }
				style={ style.container }
				css={ contentCSS }
			>
				<div className="otter-business-hour__container">
					<div
						style={ style.title }
						className="otter-business-hour__title"
					>
						<RichText
							placeholder={ __( 'Opening Hours', 'otter-blocks' ) }
							value={ attributes.title }
							onChange={ title => {
								setAttributes({ title });
							} }
							tagName="span"
						/>
					</div>

					<div className="otter-business-hour__content">
						<InnerBlocks
							allowedBlocks={ [
								'core/separator',
								'themeisle-blocks/business-hours-item'
							] }
							template={ [
								[
									'themeisle-blocks/business-hours-item',
									{
										label: __( 'Monday', 'otter-blocks' ),
										time: __( '09:00 AM - 05:00 PM', 'otter-blocks' )
									}
								],
								[
									'themeisle-blocks/business-hours-item',
									{
										label: __( 'Tuesday', 'otter-blocks' ),
										time: __( '09:00 AM - 05:00 PM', 'otter-blocks' )
									}
								],
								[
									'themeisle-blocks/business-hours-item',
									{
										label: __( 'Wednesday', 'otter-blocks' ),
										time: __( '09:00 AM - 05:00 PM', 'otter-blocks' )
									}
								],
								[
									'themeisle-blocks/business-hours-item',
									{
										label: __( 'Thursday', 'otter-blocks' ),
										time: __( '09:00 AM - 05:00 PM', 'otter-blocks' )
									}
								],
								[
									'themeisle-blocks/business-hours-item',
									{
										label: __( 'Friday', 'otter-blocks' ),
										time: __( '09:00 AM - 05:00 PM', 'otter-blocks' )
									}
								],
								[
									'themeisle-blocks/business-hours-item',
									{
										label: __( 'Saturday', 'otter-blocks' ),
										time: __( 'Closed', 'otter-blocks' ),
										timeColor: '#F8002A'
									}
								],
								[
									'themeisle-blocks/business-hours-item',
									{
										label: __( 'Sunday', 'otter-blocks' ),
										time: __( 'Closed', 'otter-blocks' ),
										timeColor: '#F8002A'
									}
								]
							] }
							renderAppender={ isSelected ? InnerBlocks.ButtonBlockAppender : '' }
						/>
					</div>
				</div>
			</div>
		</Fragment>
	);
};

export default Edit;
