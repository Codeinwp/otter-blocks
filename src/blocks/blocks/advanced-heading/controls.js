/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	Dropdown,
	DropdownMenu,
	RangeControl,
	ToolbarGroup
} from '@wordpress/components';

import {
	AlignmentToolbar,
	BlockControls
} from '@wordpress/block-editor';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { GoogleFontsControl } from '../../components/index.js';
import { useResponsiveAttributes } from '../../helpers/utility-hooks.js';

const Controls = ({
	attributes,
	setAttributes
}) => {
	const { responsiveSetAttributes, responsiveGetAttributes } = useResponsiveAttributes( setAttributes );

	const changeFontFamily = value => {
		if ( ! value ) {
			setAttributes({
				fontFamily: value,
				fontVariant: value
			});
		} else {
			setAttributes({
				fontFamily: value,
				fontVariant: 'normal',
				fontStyle: 'normal'
			});
		}
	};

	const wrapTagIntoIcon = tag => ( <span className='o-list-elem-controls'>{ tag }</span> );

	const changeTag = value => {
		setAttributes({ tag: value });
	};

	return (
		<BlockControls>
			<DropdownMenu
				icon={ wrapTagIntoIcon( attributes.tag ) }
				label={ __( 'Select tag', 'otter-blocks' ) }
				className="components-toolbar"
				controls={ [
					{
						title: __( 'Heading', 'otter-blocks' ) + ' 1',
						icon: wrapTagIntoIcon( 'h1' ),
						onClick: () => changeTag( 'h1' )
					},
					{
						title: __( 'Heading', 'otter-blocks' ) + ' 2',
						icon: wrapTagIntoIcon( 'h2' ),
						onClick: () => changeTag( 'h2' )
					},
					{
						title: __( 'Heading', 'otter-blocks' ) + ' 3',
						icon: wrapTagIntoIcon( 'h3' ),
						onClick: () => changeTag( 'h3' )
					},
					{
						title: __( 'Heading', 'otter-blocks' ) + ' 4',
						icon: wrapTagIntoIcon( 'h4' ),
						onClick: () => changeTag( 'h4' )
					},
					{
						title: __( 'Heading', 'otter-blocks' ) + ' 5',
						icon: wrapTagIntoIcon( 'h5' ),
						onClick: () => changeTag( 'h5' )
					},
					{
						title: __( 'Heading', 'otter-blocks' ) + ' 6',
						icon: wrapTagIntoIcon( 'h6' ),
						onClick: () => changeTag( 'h6' )
					},
					{
						title: __( 'Division', 'otter-blocks' ),
						icon: wrapTagIntoIcon( 'div' ),
						onClick: () => changeTag( 'div' )
					},
					{
						title: __( 'Paragraph', 'otter-blocks' ),
						icon: wrapTagIntoIcon( 'p' ),
						onClick: () => changeTag( 'p' )
					},
					{
						title: __( 'Span Tag', 'otter-blocks' ),
						icon: wrapTagIntoIcon( 'span' ),
						onClick: () => changeTag( 'span' )
					}
				] }
			/>

			<ToolbarGroup>
				<Dropdown
					contentClassName="wp-themesiel-blocks-advanced-heading-popover-content"
					position="bottom center"
					renderToggle={ ({ isOpen, onToggle }) => (
						<Button
							className="components-dropdown-menu__toggle"
							icon={ 'editor-textcolor' }
							onClick={ onToggle }
							aria-haspopup="true"
							aria-expanded={ isOpen }
							label={ __( 'Typography Settings', 'otter-blocks' ) }
							showTooltip={ true }
						>
							<span className="components-dropdown-menu__indicator" />
						</Button>
					) }
					renderContent={ () => (
						<Fragment>
							<GoogleFontsControl
								label={ __( 'Font Family', 'otter-blocks' ) }
								value={ attributes.fontFamily }
								onChangeFontFamily={ changeFontFamily }
								valueVariant={ attributes.fontVariant }
								onChangeFontVariant={ fontVariant => setAttributes({ fontVariant }) }
								valueStyle={ attributes.fontStyle }
								onChangeFontStyle={ fontStyle => setAttributes({ fontStyle }) }
								valueTransform={ attributes.textTransform }
								onChangeTextTransform={ textTransform => setAttributes({ textTransform }) }
							/>


							<RangeControl
								label={ __( 'Line Height', 'otter-blocks' ) }
								value={ attributes.lineHeight }
								onChange={ lineHeight => setAttributes({ lineHeight }) }
								step={ 0.1 }
								min={ 0 }
								max={ 3 }
							/>

							<RangeControl
								label={ __( 'Letter Spacing', 'otter-blocks' ) }
								value={ attributes.letterSpacing }
								onChange={ letterSpacing => setAttributes({ letterSpacing }) }
								step={ 0.1 }
								min={ -50 }
								max={ 100 }
							/>
						</Fragment>
					) }
				/>
			</ToolbarGroup>
			<ToolbarGroup>
				<AlignmentToolbar
					value={ responsiveGetAttributes([ attributes.align, attributes.alignTablet, attributes.alignMobile  ]) ?? 'left' }
					onChange={ align => {
						responsiveSetAttributes( align, [ 'align', 'alignTablet', 'alignMobile' ]);
					} }
				/>
			</ToolbarGroup>
		</BlockControls>
	);
};

export default Controls;
