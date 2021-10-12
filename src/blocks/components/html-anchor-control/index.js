/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { InspectorAdvancedControls } from '@wordpress/block-editor';

import { useInstanceId } from '@wordpress/compose';

import {
	BaseControl,
	Button,
	Notice
} from '@wordpress/components';

import {
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import './editor.scss';

const HTMLAnchorControl = ({
	value,
	onChange
}) => {
	const instanceId = useInstanceId( HTMLAnchorControl );

	useEffect( () => setID( value ), [ value ]);

	const [ isEditing, setEditing ] = useState( false );
	const [ ID, setID ] = useState( null );

	const isInvalid = undefined !== window.themeisleGutenberg.blockIDs && value !== ID && window.themeisleGutenberg.blockIDs.includes( ID );

	return (
		<InspectorAdvancedControls>
			<BaseControl
				label={ __( 'HTML Anchor', 'otter-blocks' ) }
				help={ __( 'Anchors lets you link directly to a section on a page.', 'otter-blocks' ) }
				id={ `otter-html-anchor-control-${ instanceId }` }
			>
				<div className="otter-html-anchor-control">
					<input
						type="text"
						className="otter-html-anchor-control-input"
						readonly={ isEditing ? false : 'readonly' }
						value={ isEditing ? ID : value }
						onChange={ e => setID( e.target.value ) }
						onClick={ e => e.target.select() }
					/>

					<Button
						icon={ isEditing ? 'yes' : 'edit' }
						label={ isEditing ? __( 'Save', 'otter-blocks' ) : __( 'Edit', 'otter-blocks' ) }
						showTooltip={ true }
						disabled={ isInvalid ? true : false }
						className={ classnames(
							'otter-html-anchor-control-button',
							{ 'is-saved': ! isEditing }
						) }
						onClick={ () => {
							if ( isEditing && value !== ID ) {
								const index = window.themeisleGutenberg.blockIDs.findIndex( e => e === value );
								window.themeisleGutenberg.blockIDs[ index ] = ID;
								onChange( ID );
							}
							setEditing( ! isEditing );
						} }
					/>
				</div>
			</BaseControl>

			{ isInvalid && (
				<Notice
					status="warning"
					isDismissible={ false }
					className="otter-html-anchor-control-notice"
				>
					{ __( 'This ID has already been used in this page. Please consider using a different ID to avoid conflict.', 'otter-blocks' ) }
				</Notice>
			) }
		</InspectorAdvancedControls>
	);
};

export default HTMLAnchorControl;
