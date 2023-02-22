import { Dispatch, SetStateAction } from 'react';

export type BlockProps<T> = {
	attributes: Partial< T & { className?: string }>
	setAttributes: ( attributes: Partial<T & { className?: string }> ) => void
	isSelected: boolean
	clientId: string
	name: string
	toggleSelection: ( value: boolean ) => void
}

export interface InspectorProps<T> {
	attributes: Partial<T>
	setAttributes: ( attributes: Partial<T> ) => void
}

export type ImagePosition = {
	x: number,
	y: number
}

export type MediaImageProps = {
	id: number,
	url: string,
	alt: string
}

export type BoxType = {
	top?: string
	right?: string
	bottom?: string
	left?: string
}

// Alliases to help us in chaning the type easly and uniformly
export type MarginType = BoxType
export type PaddingType = BoxType
export type BorderType = BoxType
export type BorderRadius = BoxType // the core use something like { topLeft: string; topRight: string; bottomRight: string; bottomLeft: string; }, might migrate this in the future

export type BoxShadow = {
    color: string
    colorOpacity: number
    blur: number
    spread: number
    horizontal: number
    vertical: number
}

export type OtterNodeCSSOptions = {
	selector: string
}

export type OtterSetNodeCSS = ( css: string[], media: string[]) => void;

export type OtterNodeCSSReturn = [
	string,
	OtterSetNodeCSS,
	Dispatch<SetStateAction<{node: HTMLStyleElement | null, cssNodeName: string}>>
]

export interface OtterBlock<T> {
	attributes: T & { className: string, customCSS: string | null, hasCustomCSS: boolean}
	clientId: string
	innerBlocks: OtterBlock<T>[]
	isValid: boolean
	name: string
	originalContent: string
	validationIssues: unknown[]
}

export type ResponsiveProps<T> = {
	desktop?: T
	tablet?: T
	mobile?: T
}

export type Responsive<T> = {
	desktop?: T,
	tablet?: T,
	mobile?: T
}
