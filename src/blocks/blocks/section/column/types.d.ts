import { BlockProps, BorderType, ImagePosition, MarginType, MediaImageProps, PaddingType, InspectorProps } from '../../../helpers/blocks';

type Attributes = {
	id: string
	padding: PaddingType
	paddingTablet: PaddingType
	paddingMobile: PaddingType
	margin: MarginType
	marginTablet: MarginType
	marginMobile: MarginType
	color: string
	colorHover: string
	linkColor: string
	backgroundType: string
	backgroundColor: string
	backgroundImage: MediaImageProps
	backgroundAttachment: string
	backgroundPosition: ImagePosition
	backgroundRepeat: string
	backgroundSize: number
	backgroundGradient: string
	backgroundOverlayOpacity: number
	backgroundOverlayType: string
	backgroundOverlayColor: string
	backgroundOverlayImage: ImagePosition
	backgroundOverlayAttachment: string
	backgroundOverlayPosition: ImagePosition
	backgroundOverlayRepeat: string
	backgroundOverlaySize: number
	backgroundOverlayGradient: string
	backgroundOverlayFilterBlur: number
	backgroundOverlayFilterBrightness: number
	backgroundOverlayFilterContrast: number
	backgroundOverlayFilterGrayscale: number
	backgroundOverlayFilterHue: number
	backgroundOverlayFilterSaturate: number
	backgroundOverlayBlend: string
	backgroundColorHover: string
	border: BorderType
	borderColor: string
	borderRadius: number
	boxShadow: boolean
	boxShadowColor: string
	boxShadowColorOpacity: number
	boxShadowBlur: number
	boxShadowSpread: number
	boxShadowHorizontal: number
	boxShadowVertical: number
	columnsHTMLTag: string
	columnWidth: number
	isSynced: string[]
}

export type SectionColumnProps = BlockProps<Attributes>
export interface SectionColumnInspectorProps extends InspectorProps<Attributes> {}
