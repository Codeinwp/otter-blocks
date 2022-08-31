/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	Popover
} from '@wordpress/components';

import {
	useDispatch,
	useSelect
} from '@wordpress/data';

import {
	useEffect,
	useState
} from '@wordpress/element';

import {
	applyFormat,
	toggleFormat,
	useAnchorRef
} from '@wordpress/rich-text';

const InlineControls = ({
	name,
	value,
	activeAttributes,
	contentRef,
	Fields,
	settings,
	onChange
}) => {
	const { visiblePopover } = useSelect( select => {
		const { getVisiblePopover } = select( 'themeisle-gutenberg/data' );
		return {
			visiblePopover: getVisiblePopover()
		};
	});

	const { setVisiblePopover } = useDispatch( 'themeisle-gutenberg/data' );

	const [ attributes, setAttributes ] = useState({ ...activeAttributes });

	useEffect( () => {
		setAttributes({ ...activeAttributes });
	}, [ activeAttributes ]);

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

	const anchorRef = useAnchorRef({ ref: contentRef, value, settings });

	const activeFormats = ( Boolean( value?.formats.length ) && value?.start ) ? value.formats[ value.start ]?.map( obj => obj.type ) : [];
	const showToggleButton = undefined !== activeFormats && Boolean( activeFormats.length ) && activeFormats.includes( 'themeisle-blocks/dynamic-value' ) && activeFormats.includes( 'themeisle-blocks/dynamic-link' );

	return (
		<Popover
			position="bottom-center"
			noArrow={ false }
			anchorRef={ anchorRef }
			focusOnMount={ false }
			className={
				classnames(
					'o-dynamic-popover',
					{
						'hidden': showToggleButton && name !== visiblePopover
					}
				)
			}
		>
			<Fields
				activeAttributes={ activeAttributes }
				attributes={ attributes }
				changeAttributes={ changeAttributes }
				changeType={ changeType }
				isInline={ true }
				onChange={ () => {
					const attrs = Object.fromEntries( Object.entries( attributes ).filter( ([ _, v ]) => ( null !== v && '' !== v ) ) );

					onChange(
						applyFormat( value, {
							type: name,
							attributes: attrs
						})
					);
				} }
				onRemove={ () => {
					const attrs = Object.fromEntries( Object.entries( attributes ).filter( ([ _, v ]) => ( null !== v && '' !== v ) ) );

					onChange(
						toggleFormat( value, {
							type: name,
							attributes: attrs
						})
					);
				} }
			/>

			{ showToggleButton && (
				<Button
					onClick={ () => setVisiblePopover( 'themeisle-blocks/dynamic-value' === name ? 'themeisle-blocks/dynamic-link' : 'themeisle-blocks/dynamic-value' ) }
					className="o-dynamic-popover-toggle"
				>
					{ 'themeisle-blocks/dynamic-value' === name ? __( 'Show Dynamic Link Settings', 'otter-blocks' ) : __( 'Show Dynamic Value Settings', 'otter-blocks' ) }
				</Button>
			) }
		</Popover>
	);
};

export default InlineControls;
