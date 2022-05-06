/**
 * External dependencies.
 */
import { globe } from '@wordpress/icons';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { RichTextToolbarButton } from '@wordpress/block-editor';

import { Modal } from '@wordpress/components';

import {
	Fragment,
	useState
} from '@wordpress/element';

import { toggleFormat } from '@wordpress/rich-text';

/**
 * Internal dependencies.
 */
import Fields from './components/fields.js';
import InlineControls from './components/inline-controls.js';

const Edit = ({
	isActive,
	value,
	onChange,
	activeAttributes
}) => {
	const [ isOpen, setOpen ] = useState( false );

	const [ attributes, setAttributes ] = useState({});

	const changeAttributes = obj => {
		let attrs = { ...attributes };

		Object.keys( obj ).forEach( o => {
			attrs[ o ] = obj[ o ];
		});

		attrs = Object.fromEntries( Object.entries( attrs ).filter( ([ _, v ]) => ( null !== v && '' !== v ) ) );

		setAttributes({ ...attrs });
	};

	const changeType = type => {
		setAttributes({ type });
	};

	const onApply = () => {
		const attrs = Object.fromEntries( Object.entries( attributes ).filter( ([ _, v ]) => ( null !== v && '' !== v ) ) );

		onChange(
			toggleFormat( value,
				{
					type: 'themeisle-blocks/dynamic-value',
					attributes: attrs
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
						activeAttributes={ activeAttributes }
						attributes={ attributes }
						changeAttributes={ changeAttributes }
						changeType={ changeType }
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
