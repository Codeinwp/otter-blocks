/**
 * WordPress dependencies
 */
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
	setAttributes,
	className
}) => {
	const [ hasError, setError ] = useState( false );

	if ( ! attributes.slug ) {
		return (
			<Placeholder
				attributes={ attributes }
				setAttributes={ setAttributes }
				hasError={ hasError }
				setError={ setError }
				className={ className }
			/>
		);
	}

	return (
		<Fragment>
			<Controls setAttributes={ setAttributes }/>

			<Disabled>
				<ServerSideRender
					block="themeisle-blocks/plugin-cards"
					className={ attributes.className }
					attributes={ { ...attributes } }
				/>
			</Disabled>
		</Fragment>
	);
};

export default Edit;
