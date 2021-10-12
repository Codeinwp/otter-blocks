/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	Dropdown,
	DropdownMenu,
	RangeControl,
	SVG,
	Toolbar
} from '@wordpress/components';

import { BlockControls } from '@wordpress/block-editor';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import GoogleFontsControl from '../../components/google-fonts-control/index.js';

const Controls = ({
	attributes,
	setAttributes,
	changeFontFamily,
	changeFontVariant,
	changeFontStyle,
	changeTextTransform,
	changeLineHeight,
	changeLetterSpacing
}) => {
	const getTagIcon = value => {
		if ( 'h1' === value ) {
			return <SVG style={ { width: '25px', height: '20px' } }><text style={ { fontSize: '12px' } } x="0" y="15">H1</text></SVG>;
		}

		if ( 'h2' === value ) {
			return <SVG style={ { width: '25px', height: '20px' } }><text style={ { fontSize: '12px' } } x="0" y="15">H2</text></SVG>;
		}

		if ( 'h3' === value ) {
			return <SVG style={ { width: '25px', height: '20px' } }><text style={ { fontSize: '12px' } } x="0" y="15">H3</text></SVG>;
		}

		if ( 'h4' === value ) {
			return <SVG style={ { width: '25px', height: '20px' } }><text style={ { fontSize: '12px' } } x="0" y="15">H4</text></SVG>;
		}

		if ( 'h5' === value ) {
			return <SVG style={ { width: '25px', height: '20px' } }><text style={ { fontSize: '12px' } } x="0" y="15">H5</text></SVG>;
		}

		if ( 'h6' === value ) {
			return <SVG style={ { width: '25px', height: '20px' } }><text style={ { fontSize: '12px' } } x="0" y="15">H6</text></SVG>;
		}

		if ( 'div' === value ) {
			return <SVG style={ { width: '25px', height: '20px' } }><text style={ { fontSize: '12px' } } x="0" y="15">DIV</text></SVG>;
		}

		if ( 'p' === value ) {
			return <SVG style={ { width: '25px', height: '20px' } }><text x="0" y="15">P</text></SVG>;
		}

		if ( 'span' === value ) {
			return <SVG style={ { width: '25px', height: '20px' } }><text style={ { fontSize: '12px' } } x="0" y="15">SPAN</text></SVG>;
		}
	};


	const changeTag = value => {
		setAttributes({ tag: value });
	};

	return (
		<BlockControls>
			<DropdownMenu
				icon={ getTagIcon( attributes.tag ) }
				label={ __( 'Select tag', 'otter-blocks' ) }
				className="components-toolbar"
				controls={ [
					{
						title: __( 'Heading', 'otter-blocks' ) + ' 1',
						icon: getTagIcon( 'h1' ),
						onClick: () => changeTag( 'h1' )
					},
					{
						title: __( 'Heading', 'otter-blocks' ) + ' 2',
						icon: getTagIcon( 'h2' ),
						onClick: () => changeTag( 'h2' )
					},
					{
						title: __( 'Heading', 'otter-blocks' ) + ' 3',
						icon: getTagIcon( 'h3' ),
						onClick: () => changeTag( 'h3' )
					},
					{
						title: __( 'Heading', 'otter-blocks' ) + ' 4',
						icon: getTagIcon( 'h4' ),
						onClick: () => changeTag( 'h4' )
					},
					{
						title: __( 'Heading', 'otter-blocks' ) + ' 5',
						icon: getTagIcon( 'h5' ),
						onClick: () => changeTag( 'h5' )
					},
					{
						title: __( 'Heading', 'otter-blocks' ) + ' 6',
						icon: getTagIcon( 'h6' ),
						onClick: () => changeTag( 'h6' )
					},
					{
						title: __( 'Division', 'otter-blocks' ),
						icon: getTagIcon( 'div' ),
						onClick: () => changeTag( 'div' )
					},
					{
						title: __( 'Paragraph', 'otter-blocks' ),
						icon: getTagIcon( 'p' ),
						onClick: () => changeTag( 'p' )
					},
					{
						title: __( 'Span Tag', 'otter-blocks' ),
						icon: getTagIcon( 'span' ),
						onClick: () => changeTag( 'span' )
					}
				] }
			/>

			<Toolbar>
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
								isSelect={ true }
								valueVariant={ attributes.fontVariant }
								onChangeFontVariant={ changeFontVariant }
								valueStyle={ attributes.fontStyle }
								onChangeFontStyle={ changeFontStyle }
								valueTransform={ attributes.textTransform }
								onChangeTextTransform={ changeTextTransform }
							/>

							<RangeControl
								label={ __( 'Line Height', 'otter-blocks' ) }
								value={ attributes.lineHeight }
								onChange={ changeLineHeight }
								min={ 0 }
								max={ 200 }
							/>

							<RangeControl
								label={ __( 'Letter Spacing', 'otter-blocks' ) }
								value={ attributes.letterSpacing }
								onChange={ changeLetterSpacing }
								min={ -50 }
								max={ 100 }
							/>
						</Fragment>
					) }
				/>
			</Toolbar>
		</BlockControls>
	);
};

export default Controls;
