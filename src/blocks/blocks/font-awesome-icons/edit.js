/**
 * WordPress dependencies.
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

	const blockProps = useBlockProps({
		id: attributes.id
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
