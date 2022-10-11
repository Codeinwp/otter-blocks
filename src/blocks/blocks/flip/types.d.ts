import { BlockProps, BorderType, ImagePosition, InspectorProps, MediaImageProps, PaddingType } from '../../helpers/blocks';

type Attributes = {
	id: string
	isInverted: boolean
	title: string
	description: string
	animType: string
	width: number | string
	widthTablet: string
	widthMobile: string
	height: number | string
	heightTablet: string
	heightMobile: string
	padding: number | PaddingType
	paddingTablet: PaddingType
	paddingMobile: PaddingType
	borderWidth: number
	borderColor: string
	borderRadius: number | BorderType
	backgroundColor: string
	frontVerticalAlign: string
	frontHorizontalAlign: string
	backVerticalAlign: string
	frontContentType: 'image' | 'icon'
	frontMedia: MediaImageProps
	frontMediaWidth: number | string
	frontMediaHeight: number | string
	frontBackgroundImage: MediaImageProps
	frontBackgroundType: string
	frontBackgroundColor: string
	frontBackgroundGradient: string
	frontBackgroundPosition: ImagePosition
	frontBackgroundRepeat: string
	frontBackgroundAttachment: string
	frontBackgroundSize: number
	backBackgroundImage: MediaImageProps
	backBackgroundType: string
	backBackgroundColor: string
	backBackgroundGradient: string
	backBackgroundPosition: ImagePosition
	backBackgroundRepeat: string
	backBackgroundSize: number
	backBackgroundAttachment: string
	boxShadow: boolean
	boxShadowColor: string
	boxShadowColorOpacity: number
	boxShadowBlur: number
	boxShadowHorizontal: number
	boxShadowVertical: number
	titleFontSize: number
	descriptionFontSize: number
	titleColor: string
	descriptionColor: string

}

export type FlipProps = BlockProps<Attributes>
export interface FlipInspectorProps extends InspectorProps<Attributes> {
	currentSide: string
	setSide: ( s: string ) => void
}
