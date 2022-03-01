import { BlockProps } from "../../helpers/blocks"

type Attributes = {
	id: string
	title: string
	percentage: number
	duration: number
	titleStyle: string
	height: number
	fontSizeTitle: string
	fontSizePercent: number
	strokeWidth: number
	backgroundColor: string
	progressColor: string
	titleColor: string
}

export type CircleCounterPros = BlockProps<Attributes>
