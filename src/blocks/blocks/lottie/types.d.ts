import { BlockProps, InspectorProps } from "../../helpers/blocks"

type Attributes = {
	id: string
	file: {
		id: number
		url: string
	}
	trigger: string
	loop: boolean
	count: number
	speed: number
	direction: boolean
	width: number
	widthUnit: string
	ariaLabel: string
	backgroundColor: string
	backgroundGradient: string
}

export type LottieProps = BlockProps<Attributes>
export interface LottieInspectorProps extends InspectorProps<Attributes> {}
