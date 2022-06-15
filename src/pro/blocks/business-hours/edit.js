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

const { blockInit } = window.otterUtils;

const { attributes: defaultAttributes } = metadata;

/**
 * Business Hours component
 * @param {import('./types').BusinessHoursProps} props
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
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

	const blockProps = useBlockProps({
		id: attributes.id,
		style: style.container
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
