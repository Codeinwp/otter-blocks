/**
 * WordPress dependencies...
 */
import {
	isNumber, isObjectLike,
	isString
} from 'lodash';

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
import { boxValues } from '../../helpers/helper-functions';

const { attributes: defaultAttributes } = metadata;

const ALIGN_MAP = {
	'right': 'flex-end',
	'center': 'center',
	'left': 'flex-start'
};

export const alignHandler = ( align ) => {
	if ( isString( align ) ) {
		return {
			desktop: ALIGN_MAP?.[align] ?? 'center'
		};
	}

	return align;
};

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

	const Icon = themeIsleIcons.icons[ attributes.icon ];

	const getValue = field => getDefaultValueByField({ name, field, defaultAttributes, attributes });

	const inlineStyles = {
		'--border-color': attributes.borderColor,
		'--border-size': attributes.borderSize !== undefined && `${attributes.borderSize }px`,
		'--border-radius': attributes.borderRadius !== undefined && `${ attributes.borderRadius }%`,
		'--margin': ! isObjectLike( getValue( 'margin' ) ) ? getValue( 'margin' ) + 'px' : boxValues( getValue( 'margin' ), { top: '5px', right: '5px', bottom: '5px', left: '5px' }),
		'--padding': ! isObjectLike( getValue( 'padding' ) ) ? getValue( 'padding' ) + 'px' : boxValues( getValue( 'padding' ), { top: '5px', right: '5px', bottom: '5px', left: '5px' }),
		'--font-size': attributes.fontSize !== undefined && ( isNumber( getValue( 'fontSize' ) ) ? `${ getValue( 'fontSize' ) }px` : getValue( 'fontSize' ) ),
		'--align': alignHandler( attributes.align )?.desktop,
		'--align-tablet': alignHandler( attributes.align )?.tablet,
		'--align-mobile': alignHandler( attributes.align )?.mobile
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
