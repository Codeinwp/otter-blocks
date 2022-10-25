import { BlockProps, InspectorProps } from '../../../helpers/blocks';

type Attributes = {
	id: string
	gap: string
	titleColor: string
	titleBackground: string
	contentBackground: string
	borderColor: string
	isSynced: string
}

export type AccordionGroupAttrs = Partial<Attributes>
export type AccordionGroupProps = BlockProps<Attributes>
export interface AccordionGroupInspectorProps extends InspectorProps<Attributes> {}
