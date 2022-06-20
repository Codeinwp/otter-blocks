export interface IFormResponse {
	success?: boolean
	redirectLink?: string
	reasons?: string[]
	error?: string
	error_source?: string
	submitMessage: string
	provider: string
}
