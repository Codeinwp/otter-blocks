import {
	BlockProps,
	InspectorProps
} from '../../../helpers/blocks';

type Attributes = {
	id: string
	type: string
	label: string
	placeholder: string
	isRequired: boolean
	mappedName: string
	labelColor: string
	inputWidth: number
	helpText: string,
	options: string,
	multipleSelection: boolean,
}

export type FormMultipleChoiceInputProps = BlockProps<Attributes>
export interface FormMultipleChoiceInputInspectorProps extends InspectorProps<Attributes> {}
