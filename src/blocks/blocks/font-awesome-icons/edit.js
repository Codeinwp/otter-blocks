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
import { blockInit } from '../../helpers/block-utility.js';

const { attributes: defaultAttributes } = metadata;

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

	const Icon = themeIsleIcons.icons[ attributes.icon ];

	const styles = css`
		--align: ${ attributes.align };
		--borderColor: ${ attributes.borderColor };
		${ attributes.borderSize && `--borderSize: ${ attributes.borderSize }px;` }
		${ attributes.borderRadius && `--borderRadius: ${ attributes.borderRadius }%;` }
		${ attributes.margin && `--margin: ${ attributes.margin }px;` }
		${ attributes.padding && `--padding: ${ attributes.padding }px;` }
		--width: ${ attributes.fontSize + attributes.padding * 2 + attributes.borderSize * 2 }px;
		${ attributes.fontSize && `--fontSize: ${ attributes.fontSize }px;` }

		.wp-block-themeisle-blocks-font-awesome-icons-container {
			color: ${ attributes.textColor };
			background-color: ${ attributes.backgroundColor };
			${ ( 'themeisle-icons' === attributes.library && attributes.padding ) && `padding: ${ attributes.padding }px;` }
		}

		.wp-block-themeisle-blocks-font-awesome-icons-container:hover {
			color: ${ attributes.textColorHover };
			background-color: ${ attributes.backgroundColorHover };
			border-color: ${ attributes.borderColorHover };
		}

		.wp-block-themeisle-blocks-font-awesome-icons-container a {
			color: ${ attributes.textColor };
		}

		.wp-block-themeisle-blocks-font-awesome-icons-container i {
			${ attributes.fontSize && `font-size: ${ attributes.fontSize }px;` }
		}

		.wp-block-themeisle-blocks-font-awesome-icons-container svg {
			fill: ${ attributes.textColor };
		}

		.wp-block-themeisle-blocks-font-awesome-icons-container:hover svg {
			fill: ${ attributes.textColorHover };
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
