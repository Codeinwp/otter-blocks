import { AdvancedBorder, BoxPadding, BoxShadow, IconData } from '../../../common';
import { BlockProps, InspectorProps } from '../../../helpers/blocks';

type Attributes = {
	id: string
	gap: string
	titleColor: string
	titleBackground: string
	contentBackground: string
	borderColor: string
	isSynced: string
	fontFamily: string
	fontVariant: string
	fontStyle: string
	textTransform: string
	fontSize: number
	letterSpacing: number
	headerBorder: AdvancedBorder
	contentBorder: AdvancedBorder
	headerPadding: BoxPadding
	contentPadding: BoxPadding
	tag: string
	alwaysOpen: boolean
	boxShadow: BoxShadow
	iconFirst: boolean,
	activeTitleColor: string
	activeTitleBackground: string
	activeContentBackground: string
	icon: IconData
	openItemIcon: IconData
}

export type AccordionGroupProps = BlockProps<Attributes>
export interface AccordionGroupInspectorProps extends InspectorProps<Attributes> {}
