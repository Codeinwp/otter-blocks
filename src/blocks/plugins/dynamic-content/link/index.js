/**
 * External dependencies.
 */
import { globe } from '@wordpress/icons';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { BlockControls } from '@wordpress/block-editor';

import { registerFormatType } from '@wordpress/rich-text';

import {
	Popover,
	ToolbarButton,
	ToolbarGroup
} from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import {
	Fragment,
	useRef,
	useState
} from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import edit from './edit.js';

import Fields from './fields.js';

export const name = 'themeisle-blocks/dynamic-link';

export const format = {
	name,
	title: __( 'Dynamic link', 'otter-blocks' ),
	tagName: 'o-dynamic-link',
	className: null,
	attributes: {
		type: 'data-type',
		context: 'data-context',
		target: 'data-target',
		metaKey: 'data-meta-key'
	},
	edit
};

registerFormatType( name, format );

const supportedBlocks = {
	'core/button': {
		link: 'url',
		target: 'linkTarget'
	},
	'themeisle-blocks/button': {
		link: 'link',
		target: 'newTab'
	},
	'themeisle-blocks/font-awesome-icons': {
		link: 'link',
		target: 'newTab'
	}
};

const DynamicLinkControl = ({
	props,
	children
}) => {
	const [ isOpen, setOpen ] = useState( false );
	const buttonRef = useRef( null );

	const attributes = props.attributes[ supportedBlocks[ props.name ].link ] || {};

	return (
		<Fragment>
			{ children }

			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						name="dynamic-link"
						icon={ globe }
						title={ __( 'Dynamic Link', 'otter-blocks' ) }
						ref={ buttonRef }
						onClick={ () => setOpen( true ) }
					/>
				</ToolbarGroup>
			</BlockControls>

			{ isOpen && (
				<Popover
					position="bottom right"
					anchorRef={ buttonRef.current }
					className="o-dynamic-popover"
					onClose={ () => setOpen( false ) }
				>
					<Fields
						activeAttributes={ {} }
						attributes={ {} }
						changeAttributes={ () => {} }
						changeType={ () => {} }
						onChange={ () => {} }
					/>
				</Popover>
			) }
		</Fragment>
	);
};

const withDynamicLink = createHigherOrderComponent( BlockEdit => {
	return props => {
		if ( Object.keys( supportedBlocks ).includes( props.name ) ) {
			return (
				<DynamicLinkControl props={ props }>
					<BlockEdit { ...props } />
				</DynamicLinkControl>
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withConditions' );

addFilter( 'editor.BlockEdit', 'otter-pro/autocompleters/dynamic-link', withDynamicLink );
