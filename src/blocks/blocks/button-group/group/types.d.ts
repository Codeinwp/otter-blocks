import { BlockProps, InspectorProps, PaddingType, Responsive } from '../../../helpers/blocks';

type Attributes = {
	id: string
	align: string | Responsive<string>
	spacing: number | string
	paddingTopBottom: number | string
	paddingLeftRight: number | string
	paddingTablet: PaddingType
	paddingMobile: PaddingType
	collapse: string
	fontSize: number | string
	fontFamily: string
	fontVariant: string
	textTransform: string
	fontStyle: string
	lineHeight: number | string
	isSynced: string[]
}

export type ButtonGroupAttrs = Partial<Attributes>
export type ButtonGroupProps = BlockProps<Attributes>
export interface ButtonGroupInspectorProps extends InspectorProps<Attributes> {}
