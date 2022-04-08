/** @jsx jsx */
/**
 * External dependencies
 */
import { plus } from '@wordpress/icons';

import classnames from 'classnames';

import {
	css,
	jsx
} from '@emotion/react';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { createBlock } from '@wordpress/blocks';

import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

import { Icon } from '@wordpress/components';

import {
	useSelect,
	useDispatch
} from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useState,
	useRef
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import metadata from './block.json';
import Inspector from './inspector.js';
import Controls from './controls.js';
import { blockInit } from '../../../helpers/block-utility.js';

const { attributes: defaultAttributes } = metadata;

const Edit = ({
	attributes,
	setAttributes,
	isSelected,
	clientId
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const contentRef = useRef( null );

	const children = useSelect( select => {
		const { getBlock } = select( 'core/block-editor' );
		return getBlock( clientId ).innerBlocks;
	}, []);

	const [ activeTab, setActiveTab ] = useState( children.find( c => true === c.attributes.defaultOpen )?.clientId );

	const {
		insertBlock,
		removeBlock,
		selectBlock,
		moveBlockToPosition,
		updateBlockAttributes
	} = useDispatch( 'core/block-editor' );

	const toggleActiveTab = blockId => {
		if ( contentRef.current ) {
			children.forEach( block => {
				const blockContent = contentRef.current.querySelector( `#block-${ block.clientId } .wp-block-themeisle-blocks-tabs-item__content` );
				blockContent?.classList.toggle( 'active', block.clientId === blockId );
			});

			updateBlockAttributes( blockId, { defaultOpen: true });
			setActiveTab( blockId );
		}
	};

	useEffect( () => {
		toggleActiveTab( activeTab );
	}, []);

	/**
	 * Activate the first tab when no tabs are selected.
	 */
	useEffect( () => {
		if ( 0 < children?.length ) {
			if ( undefined === activeTab || ! children?.some( block => block.clientId === activeTab ) ) {
				toggleActiveTab( children[0].clientId );
			}
		}
	}, [ activeTab, children ]);

	/**
	 * ------------ Tab Actions ------------
	 *
	 * @param  blockId
	 */
	const selectTab = ( blockId ) => {
		if ( 0 < children?.length ) {
			const block = children.find( block => block.clientId === blockId );
			selectBlock( block.clientId );
		}
	};

	const moveTab = ( blockId, position ) => {
		const blockClientId = children.find( block => block.clientId === blockId )?.clientId;
		if ( blockClientId ) {
			moveBlockToPosition( blockClientId, clientId, clientId, position );
		}
	};

	const deleteTab = ( blockId ) => {
		if ( 0 < children?.length ) {
			const block = children.find( block => block.clientId === blockId );
			removeBlock( block.clientId, false );
			if ( activeTab === blockId ) {
				setActiveTab( '' );
			}
		}
	};

	const addTab = () => {
		const itemBlock = createBlock( 'themeisle-blocks/tabs-item' );
		insertBlock( itemBlock, ( children?.length ) || 0, clientId, false );
	};

	/**
	 * ------------ Tab Dynamic CSS ------------
	 */

	const styles = css`
		--borderWidth: ${ undefined !== attributes.borderWidth ? attributes.borderWidth : 3 }px;
		--borderColor: ${ attributes.borderColor };
		--activeTitleColor: ${ attributes.activeTitleColor };
		--tabColor: ${ attributes.tabColor };
	`;

	const tabHeaderStyle = css`
		display: flex;
		width: 30px;
		height: 30px;
		align-items: center;
	`;

	/**
	 * ------------ Tab Components ------------
	 */
	const TabHeader = ({
		title,
		onClick,
		active
	}) => {
		return (
			<div
				className={ classnames(
					'wp-block-themeisle-blocks-tabs__header_item',
					{
						'active': active
					}
				) }
			>
				<div onClick={ onClick }>{ title }</div>
			</div>
		);
	};

	const AddTab = () => {
		return (
			<div className="wp-block-themeisle-blocks-tabs__header_item">
				<div
					css={ tabHeaderStyle }
					onClick={ addTab }
				>
					<Icon icon={ plus } />
				</div>
			</div>
		);
	};

	const blockProps = useBlockProps({
		id: attributes.id,
		css: styles
	});

	return (
		<Fragment>
			<Controls
				children={ children }
				setAttributes={ setAttributes }
				selectedTab={ activeTab }
				selectTab={ selectTab }
				moveTab={ moveTab }
			/>

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				children={ children }
				deleteTab={ deleteTab }
				selectTab={ selectTab }
				moveTab={ moveTab }
				addTab={ addTab }
			/>

			<div { ...blockProps }>
				<div className="wp-block-themeisle-blocks-tabs__header">
					{ children?.map( tabHeader => {
						return (
							<TabHeader
								key={ tabHeader.clientId }
								title={ tabHeader.attributes.title || __( 'Insert Title', 'otter-blocks' ) }
								active={ tabHeader.clientId === activeTab }
								onClick={ () => toggleActiveTab( tabHeader.clientId ) }
							/>
						);
					}) || '' }

					{ ( isSelected || 0 === children.length ) && <AddTab /> }
				</div>

				<div
					ref={ contentRef }
					className="wp-block-themeisle-blocks-tabs__content"
				>
					<InnerBlocks
						allowedBlocks={ [ 'themeisle-blocks/tabs-item' ] }
						template={ [ [ 'themeisle-blocks/tabs-item' ] ] }
						orientation="horizontal"
						renderAppender={ false }
					/>
				</div>
			</div>
		</Fragment>
	);
};

export default Edit;
