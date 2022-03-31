/**
 * External dependencies.
 */
import { globe } from '@wordpress/icons';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { isEmpty } from 'lodash';

import { RichTextToolbarButton } from '@wordpress/block-editor';

import {
	BaseControl,
	Button,
	Modal,
	PanelBody,
	Popover
} from '@wordpress/components';

import {
	Fragment,
	useState
} from '@wordpress/element';

import { applyFormat, toggleFormat } from '@wordpress/rich-text';

/**
 * Internal dependencies.
 */
import './autocompleter.js';

const name = 'themeisle-blocks/dynamic-value';

const options = {
	'posts': {
		label: __( 'Posts', 'otter-blocks' ),
		options: [
			{
				label: __( 'Post ID', 'otter-blocks' ),
				value: 'postID'
			},
			{
				label: __( 'Post Title', 'otter-blocks' ),
				value: 'postTitle'
			}
		]
	}
};

const Fields = ({
	attributes,
	changeAttributes,
	onChange
}) => {
	return (
		<Fragment>
			<PanelBody>
				<BaseControl
					label={ __( 'Data Type', 'otter-blocks' ) }
				>
					<select
						value={ attributes.type || '' }
						onChange={ e => changeAttributes({
							type: e.target.value
						}) }
						className="components-select-control__input"
					>
						<option value="none">{ __( 'Select an option', 'otter-blocks' ) }</option>

						{ Object.keys( options ).map( i => {
							return (
								<optgroup key={ i } label={ options[i].label }>
									{ options[i].options.map( o => <option key={ o.value } value={ o.value }>{ o.label }</option> ) }
								</optgroup>
							);
						}) }
					</select>
				</BaseControl>
			</PanelBody>

			<PanelBody
				title={ __( 'Advanced', 'otter-blocks' ) }
				initialOpen={ false }
			>
			</PanelBody>

			<PanelBody>
				<Button
					isPrimary
					variant="primary"
					disabled={ isEmpty( attributes ) }
					onClick={ onChange }
				>
					{ __( 'Apply', 'otter-blocks' ) }
				</Button>
			</PanelBody>
		</Fragment>
	);
};

const InlineControls = ({
	value,
	activeAttributes,
	onChange
}) => {
	const [ attributes, setAttributes ] = useState({ ...activeAttributes });

	const changeAttributes = ( obj ) => {
		const attrs = { ...attributes };

		setAttributes({
			...attrs,
			...obj
		});
	};

	return (
		<Popover
			position="bottom center"
			focusOnMount={ false }
			className="o-dynamic-popover"
		>
			<Fields
				attributes={ attributes }
				changeAttributes={ changeAttributes }
				onChange={ () => {
					onChange(
						applyFormat( value, {
							type: name,
							attributes
						})
					);
				} }
			/>
		</Popover>
	);
};

const Edit = ({
	isActive,
	value,
	onChange,
	activeAttributes
}) => {
	const [ isOpen, setOpen ] = useState( false );

	const [ attributes, setAttributes ] = useState({});

	const changeAttributes = ( obj ) => {
		const attrs = { ...attributes };

		setAttributes({
			...attrs,
			...obj
		});
	};

	const onApply = () => {
		onChange(
			toggleFormat( value,
				{
					type: name,
					attributes
				}
			)
		);

		setOpen( false );
	};

	return (
		<Fragment>
			<RichTextToolbarButton
				icon={ globe }
				title={ __( 'Dynamic Value', 'otter-blocks' ) }
				onClick={ () => setOpen( true ) }
				isDisabled={ isActive }
				isActive={ isActive }
			/>

			{ isOpen && (
				<Modal
					title={ __( 'Dynamic Value by Otter', 'otter-blocks' ) }
					overlayClassName="o-dynamic-modal"
					onRequestClose={ () => setOpen( false ) }
				>
					<Fields
						attributes={ attributes }
						changeAttributes={ changeAttributes }
						onChange={ onApply }
					/>
				</Modal>
			) }

			{ isActive && (
				<InlineControls
					value={ value }
					activeAttributes={ activeAttributes }
					onChange={ onChange }
				/>
			) }
		</Fragment>
	);
};

export default Edit;
