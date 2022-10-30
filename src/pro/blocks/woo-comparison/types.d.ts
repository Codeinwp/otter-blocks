import { BlockProps, InspectorProps } from '../../helpers/blocks';

type Attributes = {
	id: string
	products: any[] // TODO: add the corect type
	listingType: string
	altRow: boolean
	fields: string
	rowColor: string
	headerColor: string
	textColor: string
	borderColor: string
	altRowColor: string
}

export type WooComparisonAttrs = Partial<Attributes>
export type WooComparisonProps = BlockProps<Attributes>
export interface WooComparisonInspectorProps extends InspectorProps<Attributes> {}
