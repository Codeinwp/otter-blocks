import { BoxPadding, BoxShadow, IconData } from '../../../common';
import { BlockProps, InspectorProps } from '../../../helpers/blocks';

type Attributes = {
	id: string
	schema: boolean
	gap: string | number
	titleColor: string
	titleBackground: string
	contentBackground: string
	borderColor: string
	borderStyle: string
	borderWidth: string
	isSynced: string
	fontFamily: string
	fontVariant: string
	fontStyle: string
	textTransform: string
	fontSize: number
	letterSpacing: number
	padding: BoxPadding
	paddingTablet: BoxPadding
	paddingMobile: BoxPadding
	tag: string
	alwaysOpen: boolean
	boxShadow: BoxShadow
	iconFirst: boolean,
	activeTitleColor: string
	activeTitleBackground: string
	icon: IconData
	openItemIcon: IconData
}

export type AccordionGroupProps = BlockProps<Attributes>
export interface AccordionGroupInspectorProps extends InspectorProps<Attributes> {}
