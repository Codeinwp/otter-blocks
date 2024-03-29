import { BlockProps, BoxType, InspectorProps, PaddingType } from '../../helpers/blocks';

// Remove this in future version.
type LegacyAttrs = {

	/** @deprecated */
	width: number

	/** @deprecated */
	widthTablet: number

	/** @deprecated */
	widthMobile: number

	/** @deprecated */
	borderRadius: number

	/** @deprecated */
	borderRadiusType: string

	/** @deprecated */
	borderRadiusTopRight: number

	/** @deprecated */
	borderRadiusTopLeft: number

	/** @deprecated */
	borderRadiusBottomRight: number

	/** @deprecated */
	borderRadiusBottomLeft: number
}

export type CountdownTimer = {
	days?: string
	hours?: string
	minutes?: string
	seconds?: string
}

type Attributes = {
	id: string
	date: string
	exclude: string[]
	backgroundColor: string
	valueColor: string
	labelColor: string
	separatorColor: string
	labelDistance: number
	gap: number
	gapTablet: number
	gapMobile: number
	containerWidth: string
	containerWidthTablet: string
	containerWidthMobile: string
	height: number
	heightTablet: number
	heightMobile: number
	borderRadiusBox: BoxType
	borderStyle: string
	borderWidth: number
	borderWidthTablet: number
	borderWidthMobile: number
	borderColor: string
	valueFontSize: number
	valueFontSizeTablet: number
	valueFontSizeMobile: number
	labelFontSize: number
	labelFontSizeTablet: number
	labelFontSizeMobile: number
	hasSeparators: boolean
	alignment: 'flex-start' | 'center' | 'flex-end'
	padding: PaddingType
	paddingMobile: PaddingType
	paddingTablet: PaddingType
	valueFontWeight: string
	labelFontWeight: string
	separatorAlignment: 'center'
	behaviour: 'default' | 'redirectLink' | 'hide' | 'restart'
	redirectLink: string
	mode: 'timer' | 'interval' | undefined
	timer: CountdownTimer
	startInterval: string
	endInterval: string
	onEndAction: string
} & LegacyAttrs;

export type CountdownAttrs = Partial<Attributes>
export type CountdownProps = BlockProps<Attributes>
export interface CountdownInspectorProps extends InspectorProps<Attributes> {}
