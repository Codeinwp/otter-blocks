import { BlockProps, InspectorProps } from '../../helpers/blocks';

type Attributes = Partial<{
	id: string
	title: string
	percentage: number
	duration: number
	titleStyle: string
	percentagePosition: string
	height: number
	borderRadius: number
	backgroundColor: string
	barBackgroundColor: string
	titleColor: string
	percentageColor: string
	titleFontSize: string
}>

export type ProgressAttrs = Partial<Attributes>
export type ProgressBarProps = BlockProps<Attributes>
export interface ProgressBarInspectorProps extends InspectorProps<Attributes> { }
