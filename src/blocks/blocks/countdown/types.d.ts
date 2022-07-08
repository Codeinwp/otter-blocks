import { BlockProps, InspectorProps } from '../../helpers/blocks'

type Attributes = {
	id: string
	date: string
	exclude: string[]
	backgroundColor: string
	valueColor: string
	labelColor: string
	labelDistance: number
	gap: number
	gapTablet: number
	gapMobile: number
	width: number
	widthTablet: number
	widthMobile: number
	containerWidth: number
	containerWidthTablet: number
	containerWidthMobile: number
	height: number
	heightTablet: number
	heightMobile: number
	borderRadius: number
	borderRadiusType: string
	borderRadiusTopRight: number
	borderRadiusTopLeft: number
	borderRadiusBottomRight: number
	borderRadiusBottomLeft: number
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
}

export type CountdownProps = BlockProps<Attributes>
export interface CountdownInspectorProps extends InspectorProps<Attributes> {}
