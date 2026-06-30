import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	Notice,
	PanelBody,
	SearchControl,
	TextareaControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from '@wordpress/element';

const { icons: ALL_ICONS = [], iconsMap: ICONS_MAP = {}} = window.atomicWindIcons ?? {};
const DEFAULT_ICON = 'circle';
const SVG_MAX_LENGTH = 50000;
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const ALLOWED_SVG_TAGS = new Set([
	'svg',
	'g',
	'path',
	'circle',
	'rect',
	'line',
	'polyline',
	'polygon',
	'ellipse',
	'defs',
	'clippath',
	'mask',
	'lineargradient',
	'radialgradient',
	'stop',
	'title',
	'desc',
	'text',
	'tspan',
]);
const ALLOWED_SVG_ATTRIBUTES = new Set([
	'aria-hidden',
	'class',
	'clip-path',
	'clip-rule',
	'cx',
	'cy',
	'd',
	'dx',
	'dy',
	'fill',
	'fill-opacity',
	'fill-rule',
	'focusable',
	'font-family',
	'font-size',
	'font-weight',
	'fx',
	'fy',
	'gradienttransform',
	'gradientunits',
	'height',
	'id',
	'mask',
	'offset',
	'opacity',
	'points',
	'preserveaspectratio',
	'r',
	'role',
	'rx',
	'ry',
	'spreadmethod',
	'stop-color',
	'stop-opacity',
	'stroke',
	'stroke-dasharray',
	'stroke-dashoffset',
	'stroke-linecap',
	'stroke-linejoin',
	'stroke-miterlimit',
	'stroke-opacity',
	'stroke-width',
	'text-anchor',
	'transform',
	'viewbox',
	'width',
	'x',
	'x1',
	'x2',
	'xmlns',
	'y',
	'y1',
	'y2',
]);
const SVG_ATTRIBUTE_NAMES = {
	'class': 'className',
	'clip-path': 'clipPath',
	'clip-rule': 'clipRule',
	'fill-opacity': 'fillOpacity',
	'fill-rule': 'fillRule',
	'font-family': 'fontFamily',
	'font-size': 'fontSize',
	'font-weight': 'fontWeight',
	'gradienttransform': 'gradientTransform',
	'gradientunits': 'gradientUnits',
	'preserveaspectratio': 'preserveAspectRatio',
	'spreadmethod': 'spreadMethod',
	'stop-color': 'stopColor',
	'stop-opacity': 'stopOpacity',
	'stroke-dasharray': 'strokeDasharray',
	'stroke-dashoffset': 'strokeDashoffset',
	'stroke-linecap': 'strokeLinecap',
	'stroke-linejoin': 'strokeLinejoin',
	'stroke-miterlimit': 'strokeMiterlimit',
	'stroke-opacity': 'strokeOpacity',
	'stroke-width': 'strokeWidth',
	'text-anchor': 'textAnchor',
	'viewbox': 'viewBox',
};

function isSafeSvgAttribute( name, value ) {
	const lowerName = name.toLowerCase();

	if ( lowerName.startsWith( 'on' ) ) {
		return false;
	}

	if ( ! ALLOWED_SVG_ATTRIBUTES.has( lowerName ) && ! lowerName.startsWith( 'aria-' ) ) {
		return false;
	}

	const lowerValue = value.toLowerCase();

	if (
		lowerValue.includes( 'javascript:' ) ||
		lowerValue.includes( 'vbscript:' ) ||
		lowerValue.includes( 'data:' ) ||
		/expression\s*\(/i.test( value )
	) {
		return false;
	}

	return ! /url\s*\(\s*['"]?(?!#)/i.test( value );
}

function cleanSvgAttributes( element ) {
	Array.from( element.attributes ).forEach( ( attribute ) => {
		if ( ! isSafeSvgAttribute( attribute.name, attribute.value ) ) {
			element.removeAttribute( attribute.name );
		}
	});
}

function cleanSvgNode( node ) {
	Array.from( node.childNodes ).forEach( ( child ) => {
		if ( child.nodeType === ELEMENT_NODE ) {
			const tagName = child.tagName.toLowerCase();

			if ( ! ALLOWED_SVG_TAGS.has( tagName ) ) {
				child.remove();
				return;
			}

			cleanSvgAttributes( child );
			cleanSvgNode( child );
			return;
		}

		if ( child.nodeType !== TEXT_NODE ) {
			child.remove();
		}
	});
}

function sanitizeSvgCode( svgCode ) {
	const value = ( svgCode || '' ).trim();

	if ( ! value || value.length > SVG_MAX_LENGTH ) {
		return {
			attributes: {},
			inner: '',
			isValid: false,
			svg: '',
			wasSanitized: false,
		};
	}

	const document = new window.DOMParser().parseFromString( value, 'image/svg+xml' );
	const root = document.documentElement;

	if (
		document.getElementsByTagName( 'parsererror' ).length ||
		! root ||
		root.tagName.toLowerCase() !== 'svg'
	) {
		return {
			attributes: {},
			inner: '',
			isValid: false,
			svg: '',
			wasSanitized: false,
		};
	}

	cleanSvgAttributes( root );
	cleanSvgNode( root );

	const serializer = new window.XMLSerializer();
	const inner = Array.from( root.childNodes )
		.map( ( child ) => serializer.serializeToString( child ) )
		.join( '' );

	if ( ! inner.trim() ) {
		return {
			attributes: {},
			inner: '',
			isValid: false,
			svg: '',
			wasSanitized: false,
		};
	}

	const attributes = {};
	Array.from( root.attributes ).forEach( ( attribute ) => {
		const name = SVG_ATTRIBUTE_NAMES[ attribute.name.toLowerCase() ] || attribute.name;
		attributes[ name ] = attribute.value;
	});

	const sanitizedSvg = serializer.serializeToString( root );

	return {
		attributes,
		inner,
		isValid: true,
		svg: sanitizedSvg,
		wasSanitized: sanitizedSvg !== value,
	};
}

function mergeSvgProps( blockProps, svgAttributes ) {
	const { className: svgClassName, ...attributes } = svgAttributes;

	return {
		...attributes,
		...blockProps,
		className: [ svgClassName, blockProps.className ].filter( Boolean ).join( ' ' ),
	};
}

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

function SelectedIcon( { blockProps, customSvgEnabled, sanitizedCustomSvg, svgInner } ) {
	if ( customSvgEnabled && sanitizedCustomSvg.isValid ) {
		return (
			<svg
				{ ...mergeSvgProps( blockProps, sanitizedCustomSvg.attributes ) }
				dangerouslySetInnerHTML={ { __html: sanitizedCustomSvg.inner } }
			/>
		);
	}

	if ( customSvgEnabled ) {
		return (
			<div { ...blockProps } style={ { ...blockProps.style, opacity: 0.4, fontSize: '12px' } }>
				{ __( 'Paste valid SVG code in the sidebar.', 'otter-blocks' ) }
			</div>
		);
	}

	return (
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
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const { icon, customSvgEnabled, customSvg } = attributes;
	const [ search, setSearch ] = useState( '' );
	const blockProps = useBlockProps();
	const svgInner = ICONS_MAP[ icon ] || ICONS_MAP[ DEFAULT_ICON ] || '';
	const sanitizedCustomSvg = useMemo(
		() => sanitizeSvgCode( customSvg ),
		[ customSvg ]
	);

	const filtered = useMemo( () => {
		const q = search.trim().toLowerCase();
		return q ? ALL_ICONS.filter( ( n ) => n.includes( q ) ) : ALL_ICONS;
	}, [ search ] );
	const onCustomSvgBlur = () => {
		if ( sanitizedCustomSvg.isValid && sanitizedCustomSvg.svg !== ( customSvg || '' ).trim() ) {
			setAttributes( { customSvg: sanitizedCustomSvg.svg } );
		}
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Icon', 'otter-blocks' ) }>
					{ ! customSvgEnabled && (
						<>
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
							<p style={ { margin: '12px 0', fontSize: '11px', color: '#757575', lineHeight: '1.4' } }>
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
						</>
					) }

					<ToggleControl
						label={ __( 'Custom SVG', 'otter-blocks' ) }
						checked={ !! customSvgEnabled }
						onChange={ ( value ) =>
							setAttributes( { customSvgEnabled: value } )
						}
					/>

					{ customSvgEnabled && (
						<>
							<TextareaControl
								label={ __( 'SVG code', 'otter-blocks' ) }
								value={ customSvg || '' }
								rows={ 8 }
								onBlur={ onCustomSvgBlur }
								onChange={ ( value ) =>
									setAttributes( { customSvg: value } )
								}
							/>

							{ customSvg && ! sanitizedCustomSvg.isValid && (
								<Notice
									status="warning"
									isDismissible={ false }
								>
									{ __( 'Enter a valid SVG element. Unsafe or unsupported SVG code will not render.', 'otter-blocks' ) }
								</Notice>
							) }

							{ sanitizedCustomSvg.isValid && sanitizedCustomSvg.wasSanitized && (
								<Notice
									status="info"
									isDismissible={ false }
								>
									{ __( 'Unsupported SVG markup will be removed before preview and render.', 'otter-blocks' ) }
								</Notice>
							) }
						</>
					) }
				</PanelBody>
			</InspectorControls>

			<SelectedIcon
				blockProps={ blockProps }
				customSvgEnabled={ customSvgEnabled }
				sanitizedCustomSvg={ sanitizedCustomSvg }
				svgInner={ svgInner }
			/>
		</>
	);
}
