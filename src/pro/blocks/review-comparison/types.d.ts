import { BlockProps, InspectorProps } from '../../helpers/blocks';

type Attributes = {
	id: string
	reviews: string[]
	buttonColor: string
	buttonText: string
}

export type ReviewComparisionProps = BlockProps<Attributes>
export interface ReviewComparisionInspectorProps extends InspectorProps<Attributes> {}
