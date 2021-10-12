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

import { InnerBlocks } from '@wordpress/block-editor';

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
import Inspector from './inspector.js';
import Controls from './controls.js';
import { blockInit } from '../../../helpers/block-utility.js';
import defaultAttributes from './attributes.js';

const Edit = ({
	attributes,
	setAttributes,
	className,
	isSelected,
	clientId
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const contentRef = useRef( null );

	const [ activeTab, setActiveTab ] = useState( '' );

	const children = useSelect( select => {
		const { getBlock } = select( 'core/block-editor' );
		return getBlock( clientId ).innerBlocks;
	});

	const {
		insertBlock,
		removeBlock,
		selectBlock,
		moveBlockToPosition
	} = useDispatch( 'core/block-editor' );

	const toggleActiveTab = blockId => {
		if ( contentRef.current ) {
			children.forEach( block => {
				const blockContent = contentRef.current.querySelector( `#block-${ block.clientId } .wp-block-themeisle-blocks-tabs-item__content` );
				blockContent?.classList.toggle( 'active', block.clientId === blockId );
			});

			setActiveTab( blockId );
		}
	};

	/**
	 * Activate the first tab when no tabs are selected.
	 */
	useEffect( () => {
		if ( 0 < children?.length ) {
			if ( '' === activeTab || 0 === children?.filter( block => block.clientId === activeTab ).length ) {
				toggleActiveTab( children[0].clientId );
			}
		}
	}, [ activeTab, children ]);

	/**
	 * ------------ Tab Actions ------------
	 */
	const selectTab = ( blockId ) => {
		if ( 0 < children?.length ) {
			const block = children.filter( block => block.clientId === blockId )[0];
			selectBlock( block.clientId );
		}
	};

	const moveTab = ( blockId, position ) => {
		const blockClienId = children.filter( block => block.clientId === blockId )[0]?.clientId;
		if ( blockClienId ) {
			moveBlockToPosition( blockClienId, clientId, clientId, position );
		}
	};

	const deleteTab = ( blockId ) => {
		if ( 0 < children?.length ) {
			const block = children.filter( block => block.clientId === blockId )[0];
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
	const tabStyle = css`
		.wp-block-themeisle-blocks-tabs__header_item.active {
			background-color: ${ attributes.tabColor };
		}

		.wp-block-themeisle-blocks-tabs__header_item.active div {
			color: ${ attributes.activeTitleColor };
		}

		.wp-block-themeisle-blocks-tabs__header_item, .wp-block-themeisle-blocks-tabs__header_item.active, .wp-block-themeisle-blocks-tabs__header_item.active::before, .wp-block-themeisle-blocks-tabs__header_item.active::after {
			border-width: ${ attributes.borderWidth !== undefined ? attributes.borderWidth : 3 }px;
		}
	`;

	const contentStyle = css`
		.wp-block-themeisle-blocks-tabs-item__header, .wp-block-themeisle-blocks-tabs-item__content {
			border-width: ${ attributes.borderWidth !== undefined ? attributes.borderWidth : 3 }px;
		}

		.wp-block-themeisle-blocks-tabs-item__header.active, .wp-block-themeisle-blocks-tabs-item__content.active {
			background-color: ${ attributes.tabColor };
			border-width: ${ attributes.borderWidth !== undefined ? attributes.borderWidth : 3 }px;
		}

		.wp-block-themeisle-blocks-tabs-item__header.active {
			color: ${ attributes.activeTitleColor };
		}
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

			<div
				id={ attributes.id }
				className={ className }
				style={ {
					borderColor: attributes.borderColor
				} }
			>
				<div
					css={ tabStyle }
					className="wp-block-themeisle-blocks-tabs__header"
				>
					{ children?.map( tabHeader => {
						return (
							<TabHeader
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
					css={ contentStyle }
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
