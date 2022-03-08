/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

import { Disabled } from '@wordpress/components';

import {
	Fragment,
	useState
} from '@wordpress/element';

import ServerSideRender from '@wordpress/server-side-render';

/**
 * Internal dependencies
 */
import Placeholder from './placeholder.js';
import Controls from './controls.js';

const Edit = ({
	attributes,
	setAttributes
}) => {
	const [ hasError, setError ] = useState( false );

	const blockProps = useBlockProps();

	if ( ! attributes.slug ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					attributes={ attributes }
					setAttributes={ setAttributes }
					hasError={ hasError }
					setError={ setError }
				/>
			</div>
		);
	}

	return (
		<Fragment>
			<Controls setAttributes={ setAttributes }/>

			<div { ...blockProps }>
				<Disabled>
					<ServerSideRender
						block="themeisle-blocks/plugin-cards"
						attributes={ { ...attributes } }
					/>
				</Disabled>
			</div>
		</Fragment>
	);
};

export default Edit;
