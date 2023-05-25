export interface IFormResponse {
	success?: boolean
	redirectLink?: string
	reasons?: string[]
	error?: string
	error_source?: string
	submitMessage: string
	provider: string
}

export interface FormFieldData {
	label: string
	value: string
	type: string
	metadata: {
		name: string
		size: number
		data: string
		file: File
		fieldOptionName: string
		position: number
	}
}

export interface FormDataStructure {
	handler: string
	payload: {
		formInputsData: FormFieldData[]
		emailSubject?: string
		formOption?: string
		formId?: string
		nonceValue?: string
		antiSpamTime?: number
		antiSpamHoneyPot?: boolean
		postUrl: string
		action?: string
		consent?: boolean
	}
}
