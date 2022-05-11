import { BlockProps, InspectorProps, MediaImageProps } from '../../helpers/blocks'

type Attributes = {
	id: string
	images: (MediaImageProps & {caption: string})[]
	perView: number
	gap: number
	peek: number
	autoplay: boolean
	delay: number
	hideArrows: boolean
	hideBullets: boolean
	height: number
}

export type SliderProps = BlockProps<Attributes>
export interface SliderInspectorProps extends InspectorProps<Attributes> {}
