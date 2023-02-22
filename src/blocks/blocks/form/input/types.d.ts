import {
	BlockProps,
	InspectorProps
} from '../../../helpers/blocks';
import { FormInputCommonProps } from '../common';

type Attributes = FormInputCommonProps & {
	type: string
	inputWidth: number
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

