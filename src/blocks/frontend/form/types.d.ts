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
		fieldOptionName: string
		position: number
	}
}
