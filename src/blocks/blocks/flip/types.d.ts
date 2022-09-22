import { BlockProps, ImagePosition, InspectorProps, MediaImageProps } from '../../helpers/blocks';

type Attributes = {
	id: string
	isInverted: boolean
	title: string
	description: string
	animType: string
	width: number
	height: number
	padding: number
	borderWidth: number
	borderColor: string
	borderRadius: number
	backgroundColor: string
	frontVerticalAlign: string
	frontHorizontalAlign: string
	backVerticalAlign: string
	frontMedia: MediaImage
	frontMediaWidth: number
	frontMediaHeight: number
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
export interface FlipInspectorProps extends InspectorProps<Attributes> {}
