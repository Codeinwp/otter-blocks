import { BlockProps, InspectorProps } from '../../helpers/blocks';

type Attributes = {
	id: string
	align: string | {
		desktop?: string
		tablet?: string
		mobile?: string
	}
	library: string
	prefix: string
	icon: string
	link: string
	newTab: boolean
	fontSize: number
	padding: number
	margin: number
	backgroundColor: string
	textColor: string
	borderColor: string
	backgroundColorHover: string
	textColorHover: string
	borderColorHover: string
	borderSize: number
	borderRadius: number
	isSynced: string[]
}

export type IconAttrs = Partial<Attributes>
export type IconsProps = BlockProps<Attributes>
export interface IconInspectorProps extends InspectorProps<Attributes> {}
