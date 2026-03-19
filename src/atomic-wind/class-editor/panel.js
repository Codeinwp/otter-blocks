import { useSelect, useDispatch } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { store as blocksStore } from '@wordpress/blocks';
import { Button } from '@wordpress/components';
import { close, chevronLeft, chevronRight, copy, upload, undo } from '@wordpress/icons';
import { createPortal, useState, useEffect, useRef, useCallback, memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import blockIcon from '../blocks/icon';
import { StateControls } from '../states';
import { AnimationControls } from '../animations';

const _decodeEl = document.createElement( 'textarea' );
function decodeEntities( html ) {
	_decodeEl.innerHTML = html;
	return _decodeEl.value;
}

function getTextPreview( block ) {
	if ( block.name === 'atomic-wind/text' ) {
		const raw = block.attributes?.content || '';
		const text = decodeEntities( raw.replace( /<[^>]+>/g, '' ) ).trim();
		return text.length > 30 ? text.slice( 0, 30 ) + '…' : text;
	}
	if ( block.name === 'atomic-wind/link' && block.attributes?.mode !== 'inner-blocks' ) {
		const raw = block.attributes?.content || '';
		const text = decodeEntities( raw.replace( /<[^>]+>/g, '' ) ).trim();
		return text.length > 30 ? text.slice( 0, 30 ) + '…' : text;
	}
	return '';
}

const TABS = [
	{ id: 'classname', label: __( 'Classname', 'atomic-wind' ) },
	{ id: 'state', label: __( 'State', 'atomic-wind' ) },
	{ id: 'animation', label: __( 'Animation', 'atomic-wind' ) },
];

const TreeNode = memo( ( { block, depth, selectedId, onSelect, collapsed, onToggle } ) => {
	const title = useSelect(
		( select ) => {
			const type = select( blocksStore ).getBlockType( block.name );
			return type ? type.title : block.name;
		},
		[ block.name ]
	);

	const hasChildren = block.innerBlocks && block.innerBlocks.length > 0;
	const isCollapsed = collapsed[ block.clientId ];
	const isSelected = selectedId === block.clientId;
	const preview = getTextPreview( block );

	return (
		<>
			<button
				type="button"
				className={ `aw-ce-tree-node${ isSelected ? ' is-selected' : '' }` }
				style={ { paddingLeft: depth * 16 + 8 } }
				onClick={ () => onSelect( block.clientId ) }
				data-block-id={ block.clientId }
			>
				{ hasChildren ? (
					<span
						className="aw-ce-tree-toggle"
						onClick={ ( e ) => {
							e.stopPropagation();
							onToggle( block.clientId );
						} }
						role="button"
						tabIndex={ -1 }
					>
						{ isCollapsed ? '▶' : '▼' }
					</span>
				) : (
					<span className="aw-ce-tree-toggle-spacer" />
				) }
				<span className="aw-ce-tree-title">{ title }</span>
				{ preview && (
					<span className="aw-ce-tree-preview">{ preview }</span>
				) }
			</button>
			{ hasChildren && ! isCollapsed &&
				block.innerBlocks.map( ( child ) => (
					<TreeNode
						key={ child.clientId }
						block={ child }
						depth={ depth + 1 }
						selectedId={ selectedId }
						onSelect={ onSelect }
						collapsed={ collapsed }
						onToggle={ onToggle }
					/>
				) ) }
		</>
	);
} );

const MIN_PANEL_W = 400;
const MIN_PANEL_H = 240;
const MIN_TREE_W = 120;
const MAX_TREE_W = 500;

const Panel = ( { onClose } ) => {
	const posRef = useRef( { left: Math.round( window.innerWidth / 2 - 340 ), top: 80 } );
	const sizeRef = useRef( { width: 680, height: 440 } );
	const treeWidthRef = useRef( 220 );
	const panelRef = useRef( null );
	const dragRef = useRef( null );
	const treeRef = useRef( null );
	const treeResizeRef = useRef( null );
	const [ , forceRender ] = useState( 0 );
	const [ collapsed, setCollapsed ] = useState( {} );
	const [ treeVisible, setTreeVisible ] = useState( true );
	const [ clipboard, setClipboard ] = useState( '' );
	const [ copied, setCopied ] = useState( false );
	const [ prePaste, setPrePaste ] = useState( null ); // { clientId, className } before paste
	const [ activeTab, setActiveTab ] = useState( 'classname' );

	const blocks = useSelect( ( select ) => select( blockEditorStore ).getBlocks(), [] );
	const selectedId = useSelect( ( select ) => select( blockEditorStore ).getSelectedBlockClientId(), [] );
	const selectedClassName = useSelect(
		( select ) => {
			if ( ! selectedId ) return '';
			const attrs = select( blockEditorStore ).getBlockAttributes( selectedId );
			return attrs?.className || '';
		},
		[ selectedId ]
	);
	const { selectedTitle, selectedPreview, selectedAttributes } = useSelect(
		( select ) => {
			if ( ! selectedId ) return { selectedTitle: '', selectedPreview: '', selectedAttributes: {} };
			const block = select( blockEditorStore ).getBlock( selectedId );
			if ( ! block ) return { selectedTitle: '', selectedPreview: '', selectedAttributes: {} };
			const type = select( blocksStore ).getBlockType( block.name );
			return {
				selectedTitle: type ? type.title : block.name,
				selectedPreview: getTextPreview( block ),
				selectedAttributes: block.attributes || {},
			};
		},
		[ selectedId ]
	);

	const { selectBlock, updateBlockAttributes } = useDispatch( blockEditorStore );

	const handleToggle = useCallback( ( clientId ) => {
		setCollapsed( ( prev ) => ( { ...prev, [ clientId ]: ! prev[ clientId ] } ) );
	}, [] );

	const handleSelect = useCallback( ( clientId ) => {
		selectBlock( clientId );
	}, [ selectBlock ] );

	const handleClassChange = useCallback(
		( e ) => {
			if ( ! selectedId ) return;
			const value = e.target.value.replace( /\n/g, ' ' );
			updateBlockAttributes( selectedId, { className: value } );
		},
		[ selectedId, updateBlockAttributes ]
	);

	const handleKeyDown = useCallback( ( e ) => {
		if ( e.key === 'Enter' ) {
			e.preventDefault();
		}
	}, [] );

	const handleCopy = useCallback( () => {
		if ( ! selectedClassName ) return;
		setClipboard( selectedClassName );
		navigator.clipboard?.writeText( selectedClassName );
		setCopied( true );
		setTimeout( () => setCopied( false ), 1500 );
	}, [ selectedClassName ] );

	const handlePaste = useCallback( () => {
		if ( ! selectedId || ! clipboard ) return;
		setPrePaste( { clientId: selectedId, className: selectedClassName } );
		updateBlockAttributes( selectedId, { className: clipboard } );
	}, [ selectedId, clipboard, selectedClassName, updateBlockAttributes ] );

	const handleUndoPaste = useCallback( () => {
		if ( ! prePaste ) return;
		updateBlockAttributes( prePaste.clientId, { className: prePaste.className } );
		setPrePaste( null );
	}, [ prePaste, updateBlockAttributes ] );

	const handleSetAttributes = useCallback(
		( attrs ) => {
			if ( ! selectedId ) return;
			updateBlockAttributes( selectedId, attrs );
		},
		[ selectedId, updateBlockAttributes ]
	);

	// Clear undo when selection changes
	useEffect( () => {
		setPrePaste( null );
	}, [ selectedId ] );

	// Scroll tree to selected block
	useEffect( () => {
		if ( ! selectedId || ! treeRef.current || ! treeVisible ) return;
		const node = treeRef.current.querySelector( `[data-block-id="${ selectedId }"]` );
		if ( node ) {
			node.scrollIntoView( { block: 'nearest', behavior: 'smooth' } );
		}
	}, [ selectedId, treeVisible ] );

	// Panel dragging
	useEffect( () => {
		const el = dragRef.current;
		if ( ! el ) return;

		let dragging = false;
		let offsetX = 0;
		let offsetY = 0;

		const onMouseMove = ( e ) => {
			if ( ! dragging ) return;
			e.preventDefault();
			const panel = panelRef.current;
			if ( ! panel ) return;

			const rect = panel.getBoundingClientRect();
			let newLeft = e.clientX - offsetX;
			let newTop = e.clientY - offsetY;

			newLeft = Math.max( 0, Math.min( newLeft, window.innerWidth - rect.width ) );
			newTop = Math.max( 0, Math.min( newTop, window.innerHeight - rect.height ) );

			posRef.current = { left: newLeft, top: newTop };
			panel.style.left = newLeft + 'px';
			panel.style.top = newTop + 'px';
		};

		const onMouseUp = () => {
			dragging = false;
			document.removeEventListener( 'mousemove', onMouseMove );
			document.removeEventListener( 'mouseup', onMouseUp );
		};

		const onMouseDown = ( e ) => {
			if ( e.target.closest( 'button' ) ) return;
			dragging = true;
			offsetX = e.clientX - posRef.current.left;
			offsetY = e.clientY - posRef.current.top;
			document.addEventListener( 'mousemove', onMouseMove );
			document.addEventListener( 'mouseup', onMouseUp );
		};

		el.addEventListener( 'mousedown', onMouseDown );
		return () => {
			el.removeEventListener( 'mousedown', onMouseDown );
			document.removeEventListener( 'mousemove', onMouseMove );
			document.removeEventListener( 'mouseup', onMouseUp );
		};
	}, [] );

	// Panel resize (bottom-right corner)
	useEffect( () => {
		const panel = panelRef.current;
		if ( ! panel ) return;

		let resizing = false;
		let startX, startY, startW, startH;

		const onMouseMove = ( e ) => {
			if ( ! resizing ) return;
			e.preventDefault();
			const newW = Math.max( MIN_PANEL_W, startW + ( e.clientX - startX ) );
			const newH = Math.max( MIN_PANEL_H, startH + ( e.clientY - startY ) );
			sizeRef.current = { width: newW, height: newH };
			panel.style.width = newW + 'px';
			panel.style.height = newH + 'px';
		};

		const onMouseUp = () => {
			resizing = false;
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
			document.removeEventListener( 'mousemove', onMouseMove );
			document.removeEventListener( 'mouseup', onMouseUp );
		};

		const onMouseDown = ( e ) => {
			const rect = panel.getBoundingClientRect();
			const inCorner =
				e.clientX >= rect.right - 18 &&
				e.clientY >= rect.bottom - 18;
			if ( ! inCorner ) return;

			e.preventDefault();
			resizing = true;
			startX = e.clientX;
			startY = e.clientY;
			startW = rect.width;
			startH = rect.height;
			document.body.style.cursor = 'nwse-resize';
			document.body.style.userSelect = 'none';
			document.addEventListener( 'mousemove', onMouseMove );
			document.addEventListener( 'mouseup', onMouseUp );
		};

		panel.addEventListener( 'mousedown', onMouseDown );
		return () => {
			panel.removeEventListener( 'mousedown', onMouseDown );
			document.removeEventListener( 'mousemove', onMouseMove );
			document.removeEventListener( 'mouseup', onMouseUp );
		};
	}, [] );

	// Tree sidebar resize — re-bind when tree is toggled (new DOM element)
	useEffect( () => {
		const handle = treeResizeRef.current;
		if ( ! handle ) return;

		let resizing = false;
		let startX, startW;

		const onMouseMove = ( e ) => {
			if ( ! resizing ) return;
			e.preventDefault();
			const tree = treeRef.current;
			if ( ! tree ) return;
			const newW = Math.max( MIN_TREE_W, Math.min( MAX_TREE_W, startW + ( e.clientX - startX ) ) );
			treeWidthRef.current = newW;
			tree.style.width = newW + 'px';
		};

		const onMouseUp = () => {
			resizing = false;
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
			document.removeEventListener( 'mousemove', onMouseMove );
			document.removeEventListener( 'mouseup', onMouseUp );
		};

		const onMouseDown = ( e ) => {
			e.preventDefault();
			resizing = true;
			startX = e.clientX;
			startW = treeWidthRef.current;
			document.body.style.cursor = 'col-resize';
			document.body.style.userSelect = 'none';
			document.addEventListener( 'mousemove', onMouseMove );
			document.addEventListener( 'mouseup', onMouseUp );
		};

		handle.addEventListener( 'mousedown', onMouseDown );
		return () => {
			handle.removeEventListener( 'mousedown', onMouseDown );
			document.removeEventListener( 'mousemove', onMouseMove );
			document.removeEventListener( 'mouseup', onMouseUp );
		};
	}, [ treeVisible ] );

	const renderTabContent = () => {
		if ( ! selectedId ) {
			return (
				<p className="aw-ce-classname-placeholder">
					{ __( 'Select a block to edit.', 'atomic-wind' ) }
				</p>
			);
		}

		switch ( activeTab ) {
			case 'state':
				return (
					<StateControls
						attributes={ selectedAttributes }
						setAttributes={ handleSetAttributes }
					/>
				);
			case 'animation':
				return (
					<AnimationControls
						attributes={ selectedAttributes }
						setAttributes={ handleSetAttributes }
					/>
				);
			case 'classname':
			default:
				return (
					<textarea
						className="aw-ce-classname-input"
						value={ selectedClassName }
						onChange={ handleClassChange }
						onKeyDown={ handleKeyDown }
						placeholder={ __( 'Add Tailwind classes…', 'atomic-wind' ) }
					/>
				);
		}
	};

	const panel = (
		<div
			className="aw-ce-panel"
			style={ {
				left: posRef.current.left,
				top: posRef.current.top,
				width: sizeRef.current.width,
				height: sizeRef.current.height,
			} }
			ref={ panelRef }
		>
			<div className="aw-ce-header" ref={ dragRef }>
				<div className="aw-ce-header-left">
					<span className="aw-ce-header-icon">{ blockIcon }</span>
					<span className="aw-ce-header-title">
						{ __( 'Atomic Wind', 'atomic-wind' ) }
					</span>
				</div>
				<Button
					icon={ close }
					label={ __( 'Close', 'atomic-wind' ) }
					onClick={ onClose }
					size="compact"
					className="aw-ce-header-close"
				/>
			</div>
			<div className="aw-ce-body">
				{ treeVisible && (
					<>
						<div
							className="aw-ce-tree"
							ref={ treeRef }
							style={ { width: treeWidthRef.current } }
						>
							{ blocks.map( ( block ) => (
								<TreeNode
									key={ block.clientId }
									block={ block }
									depth={ 0 }
									selectedId={ selectedId }
									onSelect={ handleSelect }
									collapsed={ collapsed }
									onToggle={ handleToggle }
								/>
							) ) }
						</div>
						<div className="aw-ce-tree-resize" ref={ treeResizeRef } />
					</>
				) }
				<div className="aw-ce-classname">
					<div className="aw-ce-classname-header">
						<Button
							icon={ treeVisible ? chevronLeft : chevronRight }
							label={ treeVisible ? __( 'Hide tree', 'atomic-wind' ) : __( 'Show tree', 'atomic-wind' ) }
							onClick={ () => setTreeVisible( ! treeVisible ) }
							size="compact"
							className="aw-ce-sm-btn"
						/>
						{ selectedId && (
							<span className="aw-ce-classname-label">
								{ selectedTitle }
								{ selectedPreview && (
									<span className="aw-ce-classname-label-preview">
										{ ' — ' + selectedPreview }
									</span>
								) }
							</span>
						) }
						{ selectedId && activeTab === 'classname' && (
							<div className="aw-ce-classname-actions">
								<Button
									icon={ copy }
									label={ copied ? __( 'Copied!', 'atomic-wind' ) : __( 'Copy classes', 'atomic-wind' ) }
									onClick={ handleCopy }
									size="compact"
									className={ `aw-ce-sm-btn${ copied ? ' is-copied' : '' }` }
									disabled={ ! selectedClassName }
								/>
								<Button
									icon={ upload }
									label={ __( 'Paste classes', 'atomic-wind' ) }
									onClick={ handlePaste }
									size="compact"
									className="aw-ce-sm-btn"
									disabled={ ! clipboard }
								/>
								{ prePaste && (
									<Button
										icon={ undo }
										label={ __( 'Undo paste', 'atomic-wind' ) }
										onClick={ handleUndoPaste }
										size="compact"
										className="aw-ce-sm-btn is-undo"
									/>
								) }
							</div>
						) }
					</div>
					<div className="aw-ce-tabs">
						{ TABS.map( ( tab ) => (
							<button
								key={ tab.id }
								type="button"
								className={ `aw-ce-tab${ activeTab === tab.id ? ' is-active' : '' }` }
								onClick={ () => setActiveTab( tab.id ) }
							>
								{ tab.label }
							</button>
						) ) }
					</div>
					<div className="aw-ce-classname-body">
						{ renderTabContent() }
					</div>
				</div>
			</div>
			<div className="aw-ce-resize-handle" />
		</div>
	);

	return createPortal( panel, document.body );
};

export default Panel;
