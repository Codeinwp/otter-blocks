/**
 * WordPress dependencies
 */
import { Disabled } from '@wordpress/components';

import { Fragment } from '@wordpress/element';

import ServerSideRender from '@wordpress/server-side-render';

/**
 * Internal dependencies
 */
import Controls from './controls.js';

const Edit = ({
	attributes,
	setAttributes
}) => {
	return (
		<Fragment>
			<Controls
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<Disabled>
				<ServerSideRender
					block="themeisle-blocks/sharing-icons"
					attributes={ { ...attributes } }
				/>
			</Disabled>
		</Fragment>
	);
};

export default Edit;
