import {BlockProps, InspectorProps} from "../../../helpers/blocks"

type Attributes = {
	id: string
	type: string
	label: string
	placeholder: string
	isRequired: boolean
	mappedName: string
	labelColor: string
	inputWidth: number
	helpText: string
}

export type FormInputProps = BlockProps<Attributes>
export interface FormInputInspectorProps extends InspectorProps<Attributes> {}
