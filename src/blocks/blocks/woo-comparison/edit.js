/** @jsx jsx */

/**
 * External dependencies
 */
import {
	css,
	jsx
} from '@emotion/react';

/**
 * WordPress dependencies
 */
import { Disabled } from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

import ServerSideRender from '@wordpress/server-side-render';

/**
  * Internal dependencies
  */
import defaultAttributes from './attributes.js';
import Placeholder from './placeholder.js';
import Controls from './controls.js';
import Inspector from './inspector.js';
import { blockInit } from '../../helpers/block-utility.js';

const Edit = ({
	attributes,
	setAttributes,
	clientId
}) => {
	useEffect( () => {
		if ( Boolean( attributes.products.length ) ) {
			setEditing( false );
		}
	}, []);

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const [ isEditing, setEditing ] = useState( true );

	const styles = css`
		.nv-ct-comparison-table-content {
			--bgColor: ${ attributes.rowColor };
			--headerColor: ${ attributes.headerColor };
			--color: ${ attributes.textColor };
			--borderColor: ${ attributes.borderColor };
			${ Boolean( attributes.altRow ) &&  `--alternateBg: ${ attributes.altRowColor };` }
		}
	`;

	if ( isEditing ) {
		return (
			<Placeholder
				attributes={ attributes }
				setAttributes={ setAttributes }
				onComplete={ () => setEditing( false ) }
			/>
		);
	}

	return (
		<Fragment>
			<Controls onEdit={ () => setEditing( true ) } />

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<Disabled
				css={ styles }
			>
				<ServerSideRender
					block="themeisle-blocks/woo-comparison"
					attributes={ { ...attributes } }
				/>
			</Disabled>
		</Fragment>
	);
};

export default Edit;
