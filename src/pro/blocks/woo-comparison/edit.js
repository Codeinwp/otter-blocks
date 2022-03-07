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

import { useBlockProps } from '@wordpress/block-editor';

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

const { blockInit } = window.otterUtils;

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
			${ Boolean( attributes.altRow ) && `--alternateBg: ${ attributes.altRowColor };` }
		}
	`;

	const blockProps = useBlockProps();

	if ( isEditing ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					attributes={ attributes }
					setAttributes={ setAttributes }
					onComplete={ () => setEditing( false ) }
				/>
			</div>
		);
	}

	return (
		<Fragment>
			<Controls onEdit={ () => setEditing( true ) } />

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				<Disabled
					css={ styles }
				>
					<ServerSideRender
						block="themeisle-blocks/woo-comparison"
						attributes={ { ...attributes } }
					/>
				</Disabled>
			</div>
		</Fragment>
	);
};

export default Edit;
