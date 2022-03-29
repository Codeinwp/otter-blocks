import { BlockProps, BorderType, ImagePosition, MarginType, MediaImageProps, PaddingType, InspectorProps } from "../../../helpers/blocks"

type Attributes = {
	id: string
	padding: PaddingType
	paddingTablet: PaddingType
	paddingMobile: PaddingType
	margin: MarginType
	marginTablet: MarginType
	marginMobile: MarginType
	backgroundType: string
	backgroundColor: string
	backgroundImage: MediaImageProps
	backgroundAttachment: string
	backgroundPosition: ImagePosition
	backgroundRepeat: string
	backgroundSize: number
	backgroundGradient: string
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
