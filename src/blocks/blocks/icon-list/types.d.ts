import { BlockProps, InspectorProps } from '../../helpers/blocks';

type Attributes= {
	id: string
	defaultLibrary: string
	defaultPrefix: string
	defaultIcon: string
	defaultContentColor: string
	defaultIconColor: string
	defaultIconSize: number
	defaultSize: number
	gap: number
	horizontalAlign: string
	alignmentTablet: string
	alignmentMobile: string
	gapIconLabel: string
}

export type IconListAttrs = Partial<Attributes>
export type IconListProps = BlockProps<Attributes>
export interface IconsListInspectorProps extends InspectorProps<Attributes> {}
