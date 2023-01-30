import { BlockProps, InspectorProps } from '../../../helpers/blocks';

type Attributes = {
	id: string
	placeholder: string
	content: string
	contentColor: string
	iconColor: string
	library: string
	iconPrefix: string
	icon: string
}

export type IconListItemAttrs = Partial<Attributes>
export type IconListItemProps = BlockProps<Attributes>
export interface IconsListItemInspectorProps extends InspectorProps<Attributes> {}
