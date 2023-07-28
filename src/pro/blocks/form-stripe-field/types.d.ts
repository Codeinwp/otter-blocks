import { BlockProps, InspectorProps } from '../../helpers/blocks';


type Attributes = {
	id: string
	formId: string
	label: string
	paramName: string
	mappedName: string
	type: string
	product: string
	price: string
}

export type FormStripeFieldProps = BlockProps<Attributes>
export type FormStripeFieldInspectorPros = InspectorProps<Attributes>
