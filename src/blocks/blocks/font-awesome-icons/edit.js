/**
 * External dependencies.
 */

/**
 * WordPress dependencies...
 */
import { useBlockProps } from '@wordpress/block-editor';

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
import themeIsleIcons from './../../helpers/themeisle-icons';
import {
	blockInit,
	getDefaultValueByField, useCSSNode
} from '../../helpers/block-utility.js';

import { useSelect } from '@wordpress/data';

import { buildResponsiveGetAttributes } from '../../helpers/helper-functions.js';


const { attributes: defaultAttributes } = metadata;

/**
 * Icons Component
 * @param {import('./types').IconsProps} props
 * @returns
 */
const Edit = ({
	name,
	attributes,
	setAttributes,
	isSelected,
	clientId
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const {
		responsiveGetAttributes
	} = useSelect( select => {
		const { getView } = select( 'themeisle-gutenberg/data' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;
		const view = __experimentalGetPreviewDeviceType ? __experimentalGetPreviewDeviceType() : getView();

		return {
			responsiveGetAttributes: buildResponsiveGetAttributes( view )
		};
	}, []);

	const Icon = themeIsleIcons.icons[ attributes.icon ];

	const getValue = field => getDefaultValueByField({ name, field, defaultAttributes, attributes });

	const inlineStyles = {
		'--align': attributes.align,
		'--border-color': attributes.borderColor,
		'--border-size': attributes.borderSize !== undefined && `${attributes.borderSize }px`,
		'--border-radius': attributes.borderRadius !== undefined && `${ attributes.borderRadius }%`,
		'--margin':	attributes.margin !== undefined && `${ getValue( 'margin' ) }px`,
		'--padding': attributes.padding !== undefined && `${ getValue( 'padding' ) }px`,
		'--font-size': attributes.fontSize !== undefined && `${ getValue( 'fontSize' ) }px`,
		'--align': responsiveGetAttributes([ attributes.alignment?.desktop, attributes.alignment?.tablet, attributes.alignment?.mobile ]) ?? 'center'
	};

	const [ cssNodeName, setNodeCSS ] = useCSSNode();
	useEffect( () => {
		setNodeCSS([
			`.wp-block-themeisle-blocks-font-awesome-icons-container {
				color: ${ getValue( 'textColor' ) };
				background-color: ${ getValue( 'backgroundColor' ) };
			}`,
			`.wp-block-themeisle-blocks-font-awesome-icons-container:hover {
				color: ${ getValue( 'textColorHover' ) };
				background-color: ${ getValue( 'backgroundColorHover' ) };
				border-color: ${ attributes.borderColorHover };
			}`,
			`.wp-block-themeisle-blocks-font-awesome-icons-container a {
				color: ${ getValue( 'textColor' ) };
			}`,
			`.wp-block-themeisle-blocks-font-awesome-icons-container i {
				${ getValue( 'fontSize' ) && `font-size: ${ getValue( 'fontSize' ) }px;` }
			}`,
			`.wp-block-themeisle-blocks-font-awesome-icons-container svg {
				fill: ${ getValue( 'textColor' ) };
			}`,
			`.wp-block-themeisle-blocks-font-awesome-icons-container:hover svg {
				fill: ${ getValue( 'textColorHover' ) };
			}`
		]);
	}, [
		attributes.textColor, attributes.backgroundColor,
		attributes.textColorHover, attributes.backgroundColorHover, attributes.borderColorHover,
		attributes.fontSize
	]);

	const blockProps = useBlockProps({
		id: attributes.id,
		style: inlineStyles,
		className: cssNodeName
	});

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
				getValue={ getValue }
			/>

			<div { ...blockProps }>
				<span className="wp-block-themeisle-blocks-font-awesome-icons-container">
					{ 'themeisle-icons' === attributes.library ? <Icon/> : <i className={ `${ attributes.prefix } fa-${ attributes.icon }` }></i> }
				</span>
			</div>
		</Fragment>
	);
};

export default Edit;
