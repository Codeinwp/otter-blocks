/** @jsx jsx */

/**
 * External dependencies.
 */
import {
	css,
	jsx
} from '@emotion/react';

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
	getDefaultValueByField
} from '../../helpers/block-utility.js';

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

	const Icon = themeIsleIcons.icons[ attributes.icon ];

	const getValue = field => getDefaultValueByField({ name, field, defaultAttributes, attributes });

	const styles = css`
		--align: ${ attributes.align };
		--borderColor: ${ attributes.borderColor };
		${ attributes.borderSize !== undefined && `--borderSize: ${ attributes.borderSize }px;` }
		${ attributes.borderRadius !== undefined && `--borderRadius: ${ attributes.borderRadius }%;` }
		${ attributes.margin !== undefined && `--margin: ${ getValue( 'margin' ) }px;` }
		${ attributes.padding !== undefined && `--padding: ${ getValue( 'padding' ) }px;` }
		${ attributes.fontSize !== undefined && `--fontSize: ${ getValue( 'fontSize' ) }px;` }

		.wp-block-themeisle-blocks-font-awesome-icons-container {
			color: ${ getValue( 'textColor' ) };
			background-color: ${ getValue( 'backgroundColor' ) };
			${ ( 'themeisle-icons' === attributes.library && getValue( 'padding' ) ) && `padding: ${ getValue( 'padding' ) }px;` }
		}

		.wp-block-themeisle-blocks-font-awesome-icons-container:hover {
			color: ${ getValue( 'textColorHover' ) };
			background-color: ${ getValue( 'backgroundColorHover' ) };
			border-color: ${ attributes.borderColorHover };
		}

		.wp-block-themeisle-blocks-font-awesome-icons-container a {
			color: ${ getValue( 'textColor' ) };
		}

		.wp-block-themeisle-blocks-font-awesome-icons-container i {
			${ getValue( 'fontSize' ) && `font-size: ${ getValue( 'fontSize' ) }px;` }
		}

		.wp-block-themeisle-blocks-font-awesome-icons-container svg {
			fill: ${ getValue( 'textColor' ) };
		}

		.wp-block-themeisle-blocks-font-awesome-icons-container:hover svg {
			fill: ${ getValue( 'textColorHover' ) };
		}
	`;

	const blockProps = useBlockProps({
		id: attributes.id,
		css: styles
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

			<p { ...blockProps }>
				<span className="wp-block-themeisle-blocks-font-awesome-icons-container">
					{ 'themeisle-icons' === attributes.library ? <Icon/> : <i className={ `${ attributes.prefix } fa-${ attributes.icon }` }></i> }
				</span>
			</p>
		</Fragment>
	);
};

export default Edit;
