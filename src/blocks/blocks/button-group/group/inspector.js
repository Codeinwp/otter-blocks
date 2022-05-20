/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';

import {
	ButtonGroup,
	Button,
	PanelBody,
	RangeControl,
	SelectControl
} from '@wordpress/components';

import {
	alignNone,
	positionCenter,
	positionLeft,
	positionRight,
	stretchFullWidth
} from '@wordpress/icons';

/**
 * Internal dependencies
 */
import GoogleFontsControl from '../../../components/google-fonts-control/index.js';
import SizingControl from '../../../components/sizing-control/index.js';
import ResponsiveControl from "../../../components/responsive-control";
import { useSelect } from "@wordpress/data";

/**
 *
 * @param {import('./types.js').ButtonGroupInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes,
	currentDevice
}) => {
	const changeFontFamily = value => {
		if ( ! value ) {
			setAttributes({
				fontFamily: undefined,
				fontVariant: undefined,
				fontStyle: undefined
			});
		} else {
			setAttributes({
				fontFamily: value,
				fontVariant: 'normal',
				fontStyle: 'normal'
			});
		}
	};

	const changePadding = ( type, value ) => {
		if ( 'top' === type || 'bottom' === type ) {
			setAttributes({ paddingTopBottom: value });
		}

		if ( 'right' === type || 'left' === type ) {
			setAttributes({ paddingLeftRight: value });
		}
	};

	const onAlignmentChange = value => {
		const newValue = {
			desktop: attributes.align.desktop,
			tablet: attributes.align.tablet,
			mobile: attributes.align.mobile
		}

		newValue[ currentDevice ] = value;
		setAttributes({ align: newValue });
	};

	const alignmentOptions = [
		{
			value: 'none',
			icon: alignNone,
			label: __( 'None', 'otter-blocks' ),
		},
		{
			value: 'left',
			icon: positionLeft,
			label: __( 'Align left', 'otter-blocks' ),
		},
		{
			value: 'center',
			icon: positionCenter,
			label: __( 'Align center', 'otter-blocks' ),
		},
		{
			value: 'right',
			icon: positionRight,
			label: __( 'Align right', 'otter-blocks' ),
		},
		{
			value: 'full',
			icon: stretchFullWidth,
			label: __( 'Full width', 'otter-blocks' ),
		}
	]

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Spacing', 'otter-blocks' ) }
			>
				<SizingControl
					label={ __( 'Padding', 'otter-blocks' ) }
					min={ 0 }
					max={ 100 }
					onChange={ changePadding }
					options={ [
						{
							label: __( 'Top', 'otter-blocks' ),
							type: 'top',
							value: attributes.paddingTopBottom
						},
						{
							label: __( 'Right', 'otter-blocks' ),
							type: 'right',
							value: attributes.paddingLeftRight
						},
						{
							label: __( 'Bottom', 'otter-blocks' ),
							type: 'bottom',
							value: attributes.paddingTopBottom
						},
						{
							label: __( 'Left', 'otter-blocks' ),
							type: 'left',
							value: attributes.paddingLeftRight
						}
					] }
				/>

				<RangeControl
					label={ __( 'Spacing', 'otter-blocks' ) }
					value={ attributes.spacing }
					onChange={ e => setAttributes({ spacing: e }) }
					min={ 0 }
					max={ 50 }
				/>

				<SelectControl
					label={ __( 'Collapse On', 'otter-blocks' ) }
					value={ attributes.collapse }
					options={ [
						{ label: __( 'None', 'otter-blocks' ), value: 'collapse-none' },
						{ label: __( 'Desktop', 'otter-blocks' ), value: 'collapse-desktop' },
						{ label: __( 'Tablet', 'otter-blocks' ), value: 'collapse-tablet' },
						{ label: __( 'Mobile', 'otter-blocks' ), value: 'collapse-mobile' }
					] }
					onChange={ e => setAttributes({ collapse: e }) }
				/>
				<ResponsiveControl label={ __( 'Alignment', 'otter-blocks' ) }>
					<ButtonGroup>
						{ alignmentOptions.map( option => {
							return(
								<Button
									key={ option.value }
									icon={ option.icon }
									title={ option.label }
									isPrimary={ option.value === ( attributes.align[ currentDevice ] ?? 'none' ) }
									showTooltip
									onClick={ () => onAlignmentChange( option.value ) }
								/>
							);
						}) }
					</ButtonGroup>
				</ResponsiveControl>
			</PanelBody>

			<PanelBody
				title={ __( 'Typography Settings', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<RangeControl
					label={ __( 'Font Size', 'otter-blocks' ) }
					value={ attributes.fontSize }
					onChange={ e => setAttributes({ fontSize: e }) }
					min={ 0 }
					max={ 50 }
				/>

				<GoogleFontsControl
					label={ __( 'Font Family', 'otter-blocks' ) }
					value={ attributes.fontFamily }
					onChangeFontFamily={ changeFontFamily }
					valueVariant={ attributes.fontVariant }
					onChangeFontVariant={ e => setAttributes({ fontVariant: e }) }
					valueStyle={ attributes.fontStyle }
					onChangeFontStyle={ e => setAttributes({ fontStyle: e }) }
					valueTransform={ attributes.textTransform }
					onChangeTextTransform={ e => setAttributes({ textTransform: e }) }
				/>

				<RangeControl
					label={ __( 'Line Height', 'otter-blocks' ) }
					value={ attributes.lineHeight }
					onChange={ e => setAttributes({ lineHeight: e }) }
					min={ 0 }
					max={ 200 }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
