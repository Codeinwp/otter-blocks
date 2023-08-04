import { BlockProps, InspectorProps } from '../../helpers/blocks';
import { BoxBorder } from '../../../blocks/common';


type Attributes = {
	id: string
	formId: string
	label: string
	paramName: string
	mappedName: string
	type: string
	product: string
	price: string
	fieldOptionName: string
	borderColor: string
	borderWidth: BoxBorder
	borderRadius: BoxBorder
}

export type FormStripeFieldProps = BlockProps<Attributes>
export type FormStripeFieldInspectorPros = InspectorProps<Attributes>
