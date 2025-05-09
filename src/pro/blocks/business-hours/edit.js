/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	InnerBlocks,
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Controls from './controls.js';
import Inspector from './inspector.js';
import { useCSSNode } from '../../../blocks/helpers/block-utility.js';
import { useDarkBackground } from '../../../blocks/helpers/utility-hooks.js';

const { blockInit } = window.otterUtils;

const { attributes: defaultAttributes } = metadata;

/**
 * Business Hours component
 * @param {import('./types').BusinessHoursProps} props
 * @return
 */
const Edit = ({
	attributes,
	setAttributes,
	isSelected,
	clientId,
	name
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );

		if ( undefined === attributes.id ) {
			window.oTrk?.add({ block: name, action: 'block-created', groupID: attributes.id });
		}

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

	const [ cssNodeName, setNodeCSS ] = useCSSNode();
	useEffect( () => {
		setNodeCSS([
			`.otter-business-hour__container .otter-business-hour__content .wp-block-themeisle-blocks-business-hours-item {
				font-size: ${ attributes.itemsFontSize }px;
				padding-top: ${ attributes.gap }px;
				padding-bottom: ${ attributes.gap }px;
			}`,
			`.otter-business-hour__container .otter-business-hour__content .block-editor-block-list__block:last-child .wp-block-themeisle-blocks-business-hours-item {
				border-radius: 0 0 ${ attributes.borderRadius || 0 }px ${ attributes.borderRadius || 0 }px;
			}`
		]);
	}, [ attributes.itemsFontSize, attributes.gap, attributes.borderRadius ]);

	useDarkBackground( attributes.backgroundColor, attributes, setAttributes );

	const blockProps = useBlockProps({
		id: attributes.id,
		style: style.container,
		className: cssNodeName
	});

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

			<div { ...blockProps }>
				<div className="otter-business-hour__container">
					<div
						style={ style.title }
						className="otter-business-hour__title"
					>
						<RichText
							placeholder={ __( 'Opening Hours', 'otter-pro' ) }
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
										label: __( 'Monday', 'otter-pro' ),
										time: __( '09:00 AM - 05:00 PM', 'otter-pro' )
									}
								],
								[
									'themeisle-blocks/business-hours-item',
									{
										label: __( 'Tuesday', 'otter-pro' ),
										time: __( '09:00 AM - 05:00 PM', 'otter-pro' )
									}
								],
								[
									'themeisle-blocks/business-hours-item',
									{
										label: __( 'Wednesday', 'otter-pro' ),
										time: __( '09:00 AM - 05:00 PM', 'otter-pro' )
									}
								],
								[
									'themeisle-blocks/business-hours-item',
									{
										label: __( 'Thursday', 'otter-pro' ),
										time: __( '09:00 AM - 05:00 PM', 'otter-pro' )
									}
								],
								[
									'themeisle-blocks/business-hours-item',
									{
										label: __( 'Friday', 'otter-pro' ),
										time: __( '09:00 AM - 05:00 PM', 'otter-pro' )
									}
								],
								[
									'themeisle-blocks/business-hours-item',
									{
										label: __( 'Saturday', 'otter-pro' ),
										time: __( 'Closed', 'otter-pro' ),
										timeColor: '#F8002A'
									}
								],
								[
									'themeisle-blocks/business-hours-item',
									{
										label: __( 'Sunday', 'otter-pro' ),
										time: __( 'Closed', 'otter-pro' ),
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
