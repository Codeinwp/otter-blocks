/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	InnerBlocks,
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import {
	useDispatch,
	useSelect
} from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useRef
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import Inspector from './inspector.js';

const Edit = ({
	attributes,
	setAttributes,
	clientId
}) => {
	const contentRef = useRef( null );

	const {
		parentClientId,
		titleTag
	} = useSelect( select => {
		const {
			getBlock,
			getBlockRootClientId
		} = select( 'core/block-editor' );

		const parentClientId = getBlockRootClientId( clientId );
		const parentBlock = getBlock( parentClientId );

		return {
			parentClientId: parentBlock.clientId,
			titleTag: parentBlock.attributes.titleTag
		};
	}, []);

	useEffect( () => {
		if ( titleTag !== undefined && titleTag !== attributes.titleTag ) {
			setAttributes({
				titleTag: 'div' !== titleTag ? titleTag : undefined
			});
		}
	},  [ titleTag ]);

	const { selectBlock } = useDispatch( 'core/block-editor' );

	const switchActiveState = () => {
		if ( contentRef.current ) {
			const otherTabsComponents = contentRef.current?.parentNode?.querySelectorAll( ':scope > .wp-block-themeisle-blocks-tabs-item  > .wp-block-themeisle-blocks-tabs-item__header, :scope > .wp-block-themeisle-blocks-tabs-item  > .wp-block-themeisle-blocks-tabs-item__content' ) ?? [];

			otherTabsComponents?.forEach( component => component?.classList?.remove( 'active' ) );

			contentRef.current.querySelector( ':scope > .wp-block-themeisle-blocks-tabs-item__header' )?.classList.add( 'active' );
			contentRef.current.querySelector( ':scope > .wp-block-themeisle-blocks-tabs-item__content' )?.classList.add( 'active' );
		}
	};

	const blockProps = useBlockProps({
		ref: contentRef
	});

	return (
		<Fragment>
			<Inspector
				attributes={attributes}
				setAttributes={ setAttributes }
				selectParent={ () => selectBlock( parentClientId ) }
			/>

			<div { ...blockProps }>
				<RichText
					placeholder={ __( 'Add title…', 'otter-blocks' ) }
					value={ attributes.title }
					onChange={ value => setAttributes({ title: value }) }
					className={ classnames(
						'wp-block-themeisle-blocks-tabs-item__header',
						{
							'active': attributes.defaultOpen ? attributes.defaultOpen : false
						}
					) }
					tagName={ attributes.titleTag ?? 'div' }
					onClick={ switchActiveState }
					withoutInteractiveFormatting
				/>

				<div className="wp-block-themeisle-blocks-tabs-item__content">
					<InnerBlocks
						template={ [[ 'core/paragraph' ]] }
					/>
				</div>
			</div>
		</Fragment>
	);
};

export default Edit;
