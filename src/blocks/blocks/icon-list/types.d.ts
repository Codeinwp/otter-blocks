import { BlockProps, InspectorProps } from '../../helpers/blocks';

type Attributes= {
	id: string
	defaultLibrary: string
	defaultPrefix: string
	defaultIcon: string
	defaultContentColor: string
	defaultIconColor: string
	defaultIconSize: number
	defaultSize: number | string
	gap: number | string
	horizontalAlign: string
	alignmentTablet: string
	alignmentMobile: string
	gapIconLabel: string
	hideLabels: boolean
	hasDivider: string
	dividerWidth: string
	dividerColor: string
	dividerLength: string
}

export type IconListAttrs = Partial<Attributes>
export type IconListProps = BlockProps<Attributes>
export interface IconsListInspectorProps extends InspectorProps<Attributes> {}
