/**
 * External dependencies.
 */
import hexToRgba from 'hex-rgba';

window.hexToRgba = hexToRgba; // Warning for future self: do not delete!!!

import { v4 as uuidv4 } from 'uuid';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalColorGradientControl as ColorGradientControl,
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
import ControlPanelControl from '../../components/control-panel-control/index.js';
import { getEditorIframe, useCSSNode } from '../../helpers/block-utility';

/**
 * Resolve a CSS custom property to its computed value against the editor canvas.
 *
 * In the iframed editor (`apiVersion: 3`) theme CSS variables are defined on the
 * iframe document's `:root`, not the top-level document — so resolve against the
 * iframe document when present and fall back to the top document otherwise.
 *
 * @param {string} cssVar A `var( --name )` expression.
 * @return {string} The resolved value.
 */
const resolveCSSVariable = ( cssVar ) => {
	const ownerDocument = getEditorIframe()?.contentWindow?.document ?? document;
	return getComputedStyle( ownerDocument.documentElement, null )
		.getPropertyValue( cssVar?.replace( 'var(', '' )?.replace( ')', '' ) );
};

const Edit = ({
	BlockEdit,
	props
}) => {
	const { attributes, setAttributes } = props;

	const IDs = useSelect( select => select( 'core/block-editor' ).getBlocks().filter( block => 'core/image' === block.name && undefined !== block.attributes.anchor ).map( block => block.attributes.anchor ), []);

	useEffect( () => {
		if ( attributes.boxShadow ) {
			const isUnique = attributes.anchor ? ( 1 === IDs.filter( id => id === attributes.anchor ).length ) : false;

			if ( ! isUnique ) {
				const anchor = `wp-block-themeisle-blocks-image-${ uuidv4().substr( 0, 8 ) }`;
				setAttributes({ anchor });
			}
		} else if ( attributes.anchor && attributes.anchor.includes( 'wp-block-themeisle-blocks-image-' ) ) {
			const anchor = undefined;
			setAttributes({ anchor });
		}
	}, [ attributes.boxShadow ]);

	const changeBoxShadowColor = value => {
		setAttributes({
			boxShadowColor: ( 100 > attributes.boxShadowColorOpacity && attributes.boxShadowColor?.includes( 'var(' ) ) ?
				resolveCSSVariable( value ) :
				value
		});
	};

	const changeBoxShadow = value => {
		setAttributes({ boxShadow: value });
	};

	const changeBoxShadowColorOpacity = value => {
		const changes = { boxShadowColorOpacity: value };
		if ( 100 > value && attributes.boxShadowColor?.includes( 'var(' ) ) {
			changes.boxShadowColor = resolveCSSVariable( attributes.boxShadowColor );
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

	const [ cssNodeName, setNodeCSS ] = useCSSNode();
	useEffect( () => {
		setNodeCSS([
			attributes.boxShadow ? `img {
				box-shadow: ${ attributes.boxShadowHorizontal }px ${ attributes.boxShadowVertical }px ${ attributes.boxShadowBlur }px ${ getShadowColor() }
			}
			` : '' ]);
	}, [ attributes.boxShadowHorizontal, attributes.boxShadowVertical, attributes.boxShadowBlur, attributes.boxShadowColor, attributes.boxShadowColorOpacity, attributes.boxShadow ]);


	return (
		<Fragment>

			<BlockEdit {...props } className={ props.className + ` ${cssNodeName}` } />

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
							<ColorGradientControl
								label={ __( 'Color', 'otter-blocks' ) }
								colorValue={ attributes.boxShadowColor }
								onColorChange={ changeBoxShadowColor }
							/>

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
