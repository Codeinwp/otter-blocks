/**
 * External dependencies
 */
import { plus } from '@wordpress/icons';

import classnames from 'classnames';

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
import { boxToCSS } from '../../../helpers/helper-functions';
import classNames from 'classnames';

const { attributes: defaultAttributes } = metadata;

const TabHeader = ({
	tag,
	title,
	onClick,
	active
}) => {
	const CustomTag = tag ?? 'div';
	return (
		<div
			className={ classnames(
				'wp-block-themeisle-blocks-tabs__header_item',
				{
					'active': active
				}
			) }
		>
			<CustomTag onClick={ onClick }>{ title }</CustomTag>
		</div>
	);
};

/**
 *
 * @param {import('./types').TabsGroupProps} props
 * @returns
 */
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


	const inlineStyles = {
		'--title-border-width': boxToCSS( attributes.titleBorderWidth ),
		'--border-width': boxToCSS( attributes.borderWidth ),
		'--border-color': attributes.borderColor,
		'--title-color': attributes.titleColor,
		'--title-background': attributes.titleBackgroundColor,
		'--tab-color': attributes.tabColor,
		'--active-title-color': attributes.activeTitleColor,
		'--active-title-background': attributes.activeTitleBackgroundColor,
		'--active-title-border-color': attributes.activeBorderColor,
		'--content-text-color': attributes.contentTextColor,
		'--title-align': attributes.titleAlignment,
		'--title-padding': boxToCSS( attributes.titlePadding ),
		'--content-padding': boxToCSS( attributes.contentPadding ),
		'--border-side-width': 'left' === attributes.tabsPosition ? attributes.borderWidth?.left : attributes.borderWidth?.top
	};

	/**
	 * ------------ Tab Components ------------
	 */


	const AddTab = () => {
		return (
			<div className="wp-block-themeisle-blocks-tabs__header_item">
				<div
					onClick={ addTab }
					style={{
						display: 'flex',
						width: '30px',
						alignItems: 'center'
					}}
				>
					<Icon icon={ plus } />
				</div>
			</div>
		);
	};

	const blockProps = useBlockProps({
		id: attributes.id,
		style: inlineStyles,
		className: classNames(
			{ 'has-pos-left': 'left' === attributes.tabsPosition  },
			'is-style-border',
			`is-align-${ attributes.titleAlignment }`
		)
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
					{ children?.map( ( tabHeader, idx ) => {
						return (
							<TabHeader
								key={ tabHeader.clientId }
								tag={ attributes.titleTag }
								title={ tabHeader.attributes.title ?? `${__( 'Tab', 'otter-blocks' )} ${idx}` }
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
						template={ [[ 'themeisle-blocks/tabs-item' ]] }
						orientation="horizontal"
						renderAppender={ false }
					/>
				</div>
			</div>
		</Fragment>
	);
};

export default Edit;
