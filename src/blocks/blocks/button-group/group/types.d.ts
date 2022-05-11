import { BlockProps, InspectorProps } from '../../../helpers/blocks'

type Attributes = {
	id: string
	align: string
	spacing: number
	paddingTopBottom: number
	paddingLeftRight: number
	collapse: string
	fontSize: number
	fontFamily: string
	fontVariant: string
	textTransform: string
	fontStyle: string
	lineHeight: number
}

export type ButtonGroupProps = BlockProps<Attributes>
export interface ButtonGroupInspectorProps extends InspectorProps<Attributes> {}
