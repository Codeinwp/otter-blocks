/** @jsx jsx */
/**
 * External dependencies.
 */
import hexToRgba from 'hex-rgba';

window.hexToRgba = hexToRgba;

import {
	css,
	jsx
} from '@emotion/react';

import { v4 as uuidv4 } from 'uuid';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	ColorPalette,
	InspectorControls
} from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	ToggleControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import ColorBaseControl from '../../components/color-base-control/index.js';
import ControlPanelControl from '../../components/control-panel-control/index.js';

const Edit = ({
	BlockEdit,
	props
}) => {
	const { attributes, setAttributes } = props;

	const IDs = useSelect( select => select( 'core/block-editor' ).getBlocks().filter( block => 'core/image' === block.name && undefined !== block.attributes.anchor ).map( block => block.attributes.anchor ) );

	useEffect( () => {
		if ( attributes.boxShadow ) {
			const isUnique = attributes.anchor ? ( 1 === IDs.filter( id => id === attributes.anchor ).length ) : false;

			if ( ! isUnique ) {
				const anchor = `wp-block-themeisle-blocks-image-${ uuidv4().substr( 0, 8 ) }`;
				setAttributes({ anchor });
			}
		} else {
			if ( attributes.anchor && attributes.anchor.includes( 'wp-block-themeisle-blocks-image-' ) ) {
				const anchor = undefined;
				setAttributes({ anchor });
			}
		}
	}, [ attributes.boxShadow ]);

	const changeBoxShadowColor = value => {
		setAttributes({
			boxShadowColor: ( 100 > attributes.boxShadowColorOpacity && attributes.boxShadowColor?.includes( 'var(' ) ) ?
				getComputedStyle( document.documentElement, null ).getPropertyValue( value?.replace( 'var(', '' )?.replace( ')', '' ) ) :
				value
		});
	};

	const changeBoxShadow = value => {
		setAttributes({ boxShadow: value });
	};

	const changeBoxShadowColorOpacity = value => {
		const changes = { boxShadowColorOpacity: value };
		if ( 100 > value && attributes.boxShadowColor?.includes( 'var(' ) ) {
			changes.boxShadowColor = getComputedStyle( document.documentElement, null ).getPropertyValue( attributes.boxShadowColor.replace( 'var(', '' ).replace( ')', '' ) );
		}
		setAttributes( changes );
	};

	const changeBoxShadowBlur = value => {
		setAttributes({ boxShadowBlur: value });
	};

	const changeBoxShadowHorizontal = value => {
		setAttributes({ boxShadowHorizontal: value });
	};

	const changeBoxShadowVertical = value => {
		setAttributes({ boxShadowVertical: value });
	};

	const getShadowColor = () => {
		if ( attributes.boxShadowColor ) {
			if ( attributes.boxShadowColor.includes( '#' ) && 0 <= attributes.boxShadowColorOpacity ) {
				return hexToRgba( attributes.boxShadowColor, attributes.boxShadowColorOpacity || 0.00001 );
			}
			return attributes.boxShadowColor;
		}
		return hexToRgba( '#000000', attributes.boxShadowColorOpacity !== undefined ? ( attributes.boxShadowColorOpacity || 0.00001 ) : 1 );
	};

	const style = css`
		img {
			box-shadow: ${ attributes.boxShadowHorizontal }px ${ attributes.boxShadowVertical }px ${ attributes.boxShadowBlur }px ${ getShadowColor() }
		}
	`;

	return (
		<Fragment>
			{ attributes.boxShadow ? (
				<BlockEdit { ...props } css={ style } />
			) : (
				<BlockEdit { ...props } />
			) }

			<InspectorControls>
				<PanelBody
					title={ __( 'Box Shadow', 'otter-blocks' ) }
					initialOpen={ false }
				>
					<ToggleControl
						label={ __( 'Shadow Properties', 'otter-blocks' ) }
						checked={ attributes.boxShadow }
						onChange={ changeBoxShadow }
					/>

					{ attributes.boxShadow && (
						<Fragment>
							<ColorBaseControl
								label={ __( 'Color', 'otter-blocks' ) }
								colorValue={ attributes.boxShadowColor }
							>
								<ColorPalette
									label={ __( 'Color', 'otter-blocks' ) }
									value={ attributes.boxShadowColor }
									onChange={ changeBoxShadowColor }
								/>
							</ColorBaseControl>

							<ControlPanelControl
								label={ __( 'Shadow Properties', 'otter-blocks' ) }
							>
								<RangeControl
									label={ __( 'Opacity', 'otter-blocks' ) }
									value={ attributes.boxShadowColorOpacity }
									onChange={ changeBoxShadowColorOpacity }
									min={ 0 }
									max={ 100 }
								/>

								<RangeControl
									label={ __( 'Blur', 'otter-blocks' ) }
									value={ attributes.boxShadowBlur }
									onChange={ changeBoxShadowBlur }
									min={ 0 }
									max={ 100 }
								/>

								<RangeControl
									label={ __( 'Horizontal', 'otter-blocks' ) }
									value={ attributes.boxShadowHorizontal }
									onChange={ changeBoxShadowHorizontal }
									min={ -100 }
									max={ 100 }
								/>

								<RangeControl
									label={ __( 'Vertical', 'otter-blocks' ) }
									value={ attributes.boxShadowVertical }
									onChange={ changeBoxShadowVertical }
									min={ -100 }
									max={ 100 }
								/>
							</ControlPanelControl>
						</Fragment>
					) }
				</PanelBody>
			</InspectorControls>
		</Fragment>
	);
};

export default Edit;
