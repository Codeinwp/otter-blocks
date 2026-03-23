import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SearchControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from '@wordpress/element';

const { icons: ALL_ICONS = [], iconsMap: ICONS_MAP = {}} = window.atomicWindIcons ?? {};

function IconPreview( { name, size, isSelected, onClick } ) {
	const svgInner = ICONS_MAP[ name ] || '';

	return (
		<button
			type="button"
			title={ name }
			onClick={ onClick }
			style={ {
				background: isSelected ? 'var(--wp-admin-theme-color, #007cba)' : 'transparent',
				border: '1px solid',
				borderColor: isSelected ? 'transparent' : '#ddd',
				borderRadius: '4px',
				cursor: 'pointer',
				padding: '6px',
				color: isSelected ? '#fff' : 'currentColor',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			} }
		>
			{ svgInner && (
				<svg
					width={ size }
					height={ size }
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					dangerouslySetInnerHTML={ { __html: svgInner } }
				/>
			) }
		</button>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const { icon } = attributes;
	const [ search, setSearch ] = useState( '' );
	const blockProps = useBlockProps();
	const svgInner = ICONS_MAP[ icon ] || '';

	const filtered = useMemo( () => {
		const q = search.trim().toLowerCase();
		return q ? ALL_ICONS.filter( ( n ) => n.includes( q ) ) : ALL_ICONS;
	}, [ search ] );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Icon', 'otter-blocks' ) }>
					<SearchControl
						label={ __( 'Search icons', 'otter-blocks' ) }
						value={ search }
						onChange={ setSearch }
					/>
					<div
						style={ {
							display: 'grid',
							gridTemplateColumns: 'repeat(6, 1fr)',
							gap: '4px',
							maxHeight: '300px',
							overflowY: 'auto',
							marginTop: '8px',
						} }
					>
						{ filtered.slice( 0, 120 ).map( ( name ) => (
							<IconPreview
								key={ name }
								name={ name }
								size="20"
								isSelected={ name === icon }
								onClick={ () => setAttributes( { icon: name } ) }
							/>
						) ) }
					</div>
					{ search && filtered.length > 120 && (
						<p style={ { fontSize: '11px', color: '#757575', marginTop: '4px' } }>
							{ __( 'Showing first 120 results — refine your search.', 'otter-blocks' ) }
						</p>
					) }
					<p style={ { margin: '12px 0 0', fontSize: '11px', color: '#757575', lineHeight: '1.4' } }>
						{ __( 'Icons by', 'otter-blocks' ) }{ ' ' }
						<a
							href="https://lucide.dev"
							target="_blank"
							rel="noopener noreferrer"
						>
							Lucide
						</a>{ ' - ' }
						{ __( 'open-source icon library.', 'otter-blocks' ) }
					</p>
				</PanelBody>
			</InspectorControls>

			{ icon && svgInner ? (
				<svg
					{ ...blockProps }
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					dangerouslySetInnerHTML={ { __html: svgInner } }
				/>
			) : (
				<div { ...blockProps } style={ { ...blockProps.style, opacity: 0.4, fontSize: '12px' } }>
					{ __( 'Select an icon in the sidebar.', 'otter-blocks' ) }
				</div>
			) }
		</>
	);
}
