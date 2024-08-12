/**
 * External dependencies.
 */
import { link } from '@wordpress/icons';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { BlockControls } from '@wordpress/block-editor';

import {
	Modal,
	ToolbarButton,
	ToolbarGroup
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useState
} from '@wordpress/element';

import { toggleFormat } from '@wordpress/rich-text';

/**
 * Internal dependencies.
 */
import {
	format as settings,
	name,
	supportedBlocks
} from './index.js';
import Fields from './fields.js';
import InlineControls from '../components/inline-controls.js';

const Edit = ({
	isActive,
	value,
	onChange,
	activeAttributes,
	contentRef
}) => {
	const {
		currentBlock,
		isQueryChild
	} = useSelect( select => {
		const {
			getSelectedBlock,
			getBlockParentsByBlockName
		} = select( 'core/block-editor' );

		const currentBlock = getSelectedBlock();

		return {
			currentBlock,
			isQueryChild: 0 < getBlockParentsByBlockName( currentBlock?.clientId, 'core/query' ).length
		};
	}, []);

	const [ isOpen, setOpen ] = useState( false );

	const [ attributes, setAttributes ] = useState({});

	const changeAttributes = obj => {
		let attrs = { ...attributes };

		Object.keys( obj ).forEach( o => {
			attrs[ o ] = obj[ o ];
		});

		attrs = Object.fromEntries( Object.entries( attrs ).filter( ([ _, v ]) => ( null !== v && '' !== v && undefined !== v ) ) );

		setAttributes({ ...attrs });
	};

	const changeType = type => {
		setAttributes({ type });
	};

	const onApply = () => {
		const attrs = Object.fromEntries( Object.entries( attributes ).filter( ([ _, v ]) => ( null !== v && '' !== v && undefined !== v ) ) );

		if ( isQueryChild ) {
			attrs.context = 'query';
		}

		onChange(
			toggleFormat( value,
				{
					type: 'themeisle-blocks/dynamic-link',
					attributes: attrs
				}
			)
		);

		setOpen( false );
	};

	// We already have another mechanism for Button blocks so we don't need to show anoter dynamic link button.
	if ( supportedBlocks[ currentBlock.name ]) {
		return null;
	}

	return (
		<Fragment>
			{ Boolean( window.themeisleGutenberg.hasModule.dynamicContent ) && (
				<BlockControls>
					<ToolbarGroup>
						<ToolbarButton
							icon={ link }
							title={ __( 'Dynamic Link', 'otter-blocks' ) }
							onClick={ () => setOpen( true ) }
							isDisabled={ isActive }
							isActive={ isActive }
							className="o-dynamic-button"
						/>
					</ToolbarGroup>
				</BlockControls>
			) }

			{ isOpen && (
				<Modal
					title={ __( 'Dynamic Link by Otter', 'otter-blocks' ) }
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
					name={ name }
					value={ value }
					activeAttributes={ activeAttributes }
					contentRef={ contentRef }
					Fields={ Fields }
					settings={ settings }
					onChange={ onChange }
				/>
			) }
		</Fragment>
	);
};

export default Edit;
