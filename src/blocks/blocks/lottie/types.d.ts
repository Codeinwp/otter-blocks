import { BlockProps, InspectorProps } from '../../helpers/blocks'

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
}

export type LottieProps = BlockProps<Attributes>
export interface LottieInspectorProps extends InspectorProps<Attributes> {}
