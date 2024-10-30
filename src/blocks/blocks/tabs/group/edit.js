/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __, sprintf } from '@wordpress/i18n';

import { createBlock } from '@wordpress/blocks';

import {
	InnerBlocks,
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import {
	useSelect,
	useDispatch,
	dispatch
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
import { blockInit, getDefaultValueByField } from '../../../helpers/block-utility.js';
import { boxToCSS, objectOrNumberAsBox, _px } from '../../../helpers/helper-functions';
import BlockAppender from '../../../components/block-appender-button';
import { useDarkBackground } from '../../../helpers/utility-hooks.js';

const { attributes: defaultAttributes } = metadata;

const TabHeader = ({
	tag,
	title,
	onClick,
	active,
	onChangeTitle
}) => {
	const CustomTag = tag ?? 'div';
	return (
		<div
			className={ classnames(
				'wp-block-themeisle-blocks-tabs__header_item',
				{
					active
				}
			) }
			onClick={ onClick }
		>
			<RichText
				placeholder={ __( 'Add title…', 'otter-blocks' ) }
				value={ title }
				onChange={ onChangeTitle }
				tagName={ tag ?? 'div' }
				withoutInteractiveFormatting
				multiline={ false }
			/>
		</div>
	);
};

const AddTabHeader = ({
	clientId,
	addTab
}) => {
	return (
		<div className='add-header-container'>
			<div className='add-header-item'>
				<BlockAppender
					buttonText={ __( 'Add Tab', 'otter-blocks' ) }
					variant="primary"
					allowedBlock="themeisle-blocks/tabs-item"
					clientId={ clientId }
					onClick={ addTab }
				/>
			</div>
		</div>
	);
};

/**
 *
 * @param {import('./types').TabsGroupProps} props
 * @return
 */
const Edit = ({
	attributes,
	setAttributes,
	isSelected,
	clientId,
	name
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const contentRef = useRef( null );

	// TODO: Replace this with the builder sync function.
	/**
	 * Get global value if it is the case.
	 * @param {import('../../../common').SyncAttrs<import('./types').TabsGroupAttrs>} field
	 * @return
	 */
	const getSyncValue = field =>{
		if ( attributes?.isSynced?.includes( field ) ) {
			return getDefaultValueByField({ name, field, defaultAttributes, attributes });
		}
		return attributes?.[field];
	};

	const children = useSelect( select => {
		const { getBlock } = select( 'core/block-editor' );
		return getBlock( clientId ).innerBlocks;
	}, []);

	const [ activeTab, setActiveTab ] = useState( children.find( c => true === c.attributes.defaultOpen )?.clientId );

	const {
		insertBlock,
		removeBlock,
		selectBlock,
		moveBlockToPosition
	} = useDispatch( 'core/block-editor' );

	const toggleActiveTab = blockId => {
		if ( contentRef.current ) {
			children.forEach( block => {
				const blockContent = contentRef.current.querySelector( `#block-${ block.clientId } > .wp-block-themeisle-blocks-tabs-item__content` );

				const blockHeader = contentRef.current.querySelector( `#block-${ block.clientId } > .wp-block-themeisle-blocks-tabs-item__header` );

				blockContent?.classList.toggle( 'active', block.clientId === blockId );
				blockHeader?.classList.toggle( 'active', block.clientId === blockId );
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

	useDarkBackground( attributes.tabColor, attributes, setAttributes );

	/**
	 * ------------ Tab Actions ------------
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
		const itemBlock = createBlock( 'themeisle-blocks/tabs-item', {
			title: sprintf(
				// Translators: %d is the tab number.
				__( 'Tab %d', 'otter-blocks' ),
				( children?.length ?? 0 ) + 1
			)
		});
		insertBlock( itemBlock, ( children?.length ) || 0, clientId, false );
	};

	/**
	 * ------------ Tab Dynamic CSS ------------
	 */
	const inlineStyles = {
		'--title-border-width': boxToCSS( getSyncValue( 'titleBorderWidth' ) ),
		'--border-width': boxToCSS( _px( getSyncValue( 'borderWidth' ) ) ),
		'--border-color': getSyncValue( 'borderColor' ),
		'--title-color': getSyncValue( 'titleColor' ),
		'--title-background': getSyncValue( 'titleBackgroundColor' ),
		'--tab-color': getSyncValue( 'tabColor' ),
		'--active-title-color': getSyncValue( 'activeTitleColor' ),
		'--active-title-background': getSyncValue( 'activeTitleBackgroundColor' ),
		'--active-title-border-color': getSyncValue( 'activeBorderColor' ),
		'--content-text-color': getSyncValue( 'contentTextColor' ),
		'--title-padding': boxToCSS( getSyncValue( 'titlePadding' ) ),
		'--content-padding': boxToCSS( getSyncValue( 'contentPadding' ) ),
		'--border-side-width': 'left' === attributes.tabsPosition ?  objectOrNumberAsBox( getSyncValue( 'borderWidth' ) )?.left :  objectOrNumberAsBox( getSyncValue( 'borderWidth' ) )?.top,
		'--font-size': _px( getSyncValue( 'titleFontSize' ) )
	};

	const blockProps = useBlockProps({
		id: attributes.id,
		style: inlineStyles,
		className: classnames(
			attributes.className,
			{ 'has-pos-left': 'left' === attributes.tabsPosition  },
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
								title={ tabHeader.attributes?.title ?? `${__( 'Tab', 'otter-blocks' )} ${idx + 1}` }
								active={ tabHeader.clientId === activeTab }
								onClick={ () => toggleActiveTab( tabHeader.clientId ) }
								onChangeTitle={ value => {
									dispatch( 'core/block-editor' ).updateBlockAttributes( tabHeader.clientId, { title: value.replace( /(\r\n|\n|\r|<br>)/gm, '' ) });
								}}
							/>
						);
					}) || '' }

					{ ( isSelected || 0 === children.length ) && (
						<AddTabHeader clientId={ clientId } addTab={ addTab } />
					) }
				</div>

				<div
					ref={ contentRef }
					className="wp-block-themeisle-blocks-tabs__content"
				>
					<InnerBlocks
						allowedBlocks={ [ 'themeisle-blocks/tabs-item' ] }
						template={ [
							[ 'themeisle-blocks/tabs-item',
								{
									title: __( 'Tab 1', 'otter-blocks' )
								},
								[[ 'core/paragraph', {
									content: __( 'This is just a placeholder to help you visualize how the content is displayed in the tabs. Feel free to edit this with your actual content.', 'otter-blocks' )
								}]]
							],
							[ 'themeisle-blocks/tabs-item',
								{
									title: __( 'Tab 2', 'otter-blocks' )
								},
								[[ 'core/paragraph', {
									content: __( 'This is just a placeholder to help you visualize how the content is displayed in the tabs. Feel free to edit this with your actual content.', 'otter-blocks' )
								}]]
							],
							[ 'themeisle-blocks/tabs-item',
								{
									title: __( 'Tab 3', 'otter-blocks' )

								},
								[[ 'core/paragraph', {
									content: __( 'This is just a placeholder to help you visualize how the content is displayed in the tabs. Feel free to edit this with your actual content.', 'otter-blocks' )
								}]]
							]
						] }
						orientation="horizontal"
						renderAppender={ false }
					/>
				</div>
			</div>
		</Fragment>
	);
};

export default Edit;
