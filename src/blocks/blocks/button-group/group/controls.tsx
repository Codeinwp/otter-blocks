/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { AlignmentToolbar, BlockControls } from '@wordpress/block-editor';
import { DropdownMenu, ToolbarGroup } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { ButtonGroupInspectorProps } from './types';
import { useResponsiveAttributes } from '../../../helpers/utility-hooks';
import { alignCenter, alignLeft, alignRight, menu } from '@wordpress/icons';


const Controls = ({
	attributes,
	setAttributes
} : ButtonGroupInspectorProps ) => {

	const { responsiveSetAttributes, responsiveGetAttributes } = useResponsiveAttributes( setAttributes );
	const iconsMapping = {
		'left': alignLeft,
		'right': alignRight,
		'center': alignCenter,
		'full': menu
	};

	return (
		<BlockControls>
			<ToolbarGroup>
				<DropdownMenu

					// @ts-ignore
					icon={ iconsMapping[responsiveGetAttributes([ attributes.align?.desktop ?? attributes.align, attributes.align?.tablet, attributes.align?.mobile ]) ?? 'left'] }
					label={ __( 'Select tag', 'otter-blocks' ) }
					className="components-toolbar"
					controls={ [
						{
							icon: alignLeft,
							title: __( 'Align Left', 'otter-blocks' ),
							onClick: () => responsiveSetAttributes( 'left', [ 'align.desktop', 'align.tablet', 'align.mobile' ], attributes.align ?? {})
						},
						{
							icon: alignCenter,
							title: __( 'Align Center', 'otter-blocks' ),
							onClick: () => responsiveSetAttributes( 'center', [ 'align.desktop', 'align.tablet', 'align.mobile' ], attributes.align ?? {})
						},
						{
							icon: alignRight,
							title: __( 'Align Right', 'otter-blocks' ),
							onClick: () => responsiveSetAttributes( 'right', [ 'align.desktop', 'align.tablet', 'align.mobile' ], attributes.align ?? {})
						},
						{
							icon: menu,
							title: __( 'Align Full', 'otter-blocks' ),
							onClick: () => responsiveSetAttributes( 'full', [ 'align.desktop', 'align.tablet', 'align.mobile' ], attributes.align ?? {})
						}
					]}
				/>
			</ToolbarGroup>
		</BlockControls>

	);
};

export default Controls;
