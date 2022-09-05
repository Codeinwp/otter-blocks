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
	helpText: string
}

export type FormInputProps = BlockProps<Attributes>
export interface FormInputInspectorProps extends InspectorProps<Attributes> {}

type FormQueryGetInformation = {
	handler: 'listId'
	payload?: {
		provider: string,
		apiKey?: string,
	},
	response?: {
		emailLists: { label: string, value: string }[]
		raw: any
	}
}

type FormQuerySubmit = {
	handler: 'submit'
	payload?: {
		provider: string,
		apiKey?: string,
	},
	response?: {
		success: boolean
		redirectLink?: string
	}
}

export type FormQueryAPI = FormQueryGetInformation | FormQuerySubmit

