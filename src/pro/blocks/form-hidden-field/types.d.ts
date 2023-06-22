import { BlockProps, InspectorProps } from '../../helpers/blocks';


type Attributes = {
	id: string
	formId: string
	label: string
	paramName: string
}

export type FormHiddenFieldProps = BlockProps<Attributes>
export type FormHiddenFieldInspectorPros = InspectorProps<Attributes>
