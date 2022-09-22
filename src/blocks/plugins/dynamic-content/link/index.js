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

import { useSelect } from '@wordpress/data';

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
import {
	getObjectFromQueryString,
	getQueryStringFromObject
} from '../../../helpers/helper-functions.js';

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
		link: 'url'
	},
	'themeisle-blocks/button': {
		link: 'link'
	},
	'themeisle-blocks/font-awesome-icons': {
		link: 'link'
	}
};

const getAttributes = ( attributes, name ) => {
	const link = attributes[ supportedBlocks[ name ].link ] || '';

	if ( ! link.includes( '#otterDynamic' ) ) {
		return {};
	}

	const attrs = getObjectFromQueryString( link );

	return attrs;
};

const DynamicLinkControl = ({
	props,
	children
}) => {
	const activeAttributes = getAttributes( props.attributes, props.name );

	const [ isOpen, setOpen ] = useState( false );
	const [ attributes, setAttributes ] = useState({ ...activeAttributes });
	const buttonRef = useRef( null );

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

	const { isQueryChild } = useSelect( select => {
		const { getBlockParentsByBlockName } = select( 'core/block-editor' );

		return {
			isQueryChild: 0 < getBlockParentsByBlockName( props.clientId, 'core/query' ).length
		};
	}, []);

	const onChange = () => {
		const attrs = Object.fromEntries( Object.entries( attributes ).filter( ([ _, v ]) => ( null !== v && '' !== v && undefined !== v ) ) );

		if ( isQueryChild ) {
			attrs.context = 'query';
		}

		props.setAttributes({ [ supportedBlocks[ props.name ].link ]: `#otterDynamic?${ getQueryStringFromObject( attrs ) }` });
	};

	const onRemove = () => {
		setAttributes({});
		props.setAttributes({ [ supportedBlocks[ props.name ].link ]: undefined });
	};

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
						activeAttributes={ activeAttributes }
						attributes={ attributes }
						isLinkControl={ true }
						changeAttributes={ changeAttributes }
						changeType={ changeType }
						onChange={ onChange }
						onRemove={ onRemove }
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
