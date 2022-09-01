import { BlockProps, InspectorProps } from '../../helpers/blocks';

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
export interface CircleCounterInspectorProps extends InspectorProps<Attributes> {}
