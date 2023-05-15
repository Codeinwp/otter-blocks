import { BlockProps, InspectorProps, PaddingType } from '../../helpers/blocks';

type Attributes = {
	id: string
	subject: string
	emailTo: string
	optionName: string
	hasCaptcha: boolean
	provider: string
	listId: string
	action: string
	submitLabel: string
	sendUserEmail: boolean
	redirectLink: string
	inputPadding: PaddingType
	inputPaddingTablet: PaddingType
	inputPaddingMobile: PaddingType
	labelColor: string
	helpLabelColor: string
	labelFontSize: number | string
	inputBorderRadius: number | PaddingType
	inputBorderColor: string
	inputBorderWidth: number | PaddingType
	inputWidth: number
	inputRequiredColor: string
	submitMessage: string
	submitMessageColor: string
	submitMessageErrorColor: string
	submitBackgroundColor: string
	submitBackgroundColorHover: string
	submitFontSize: number | string
	submitColor: string
	submitColorHover: string
	inputGap: number
	inputColor: string
	inputsGap: number
	submitStyle: string
	submitStyleTablet: string
	submitStyleMobile: string
	fromName: string
	messageFontSize: number
	inputFontSize: number
	helpFontSize: number
	inputBackgroundColor: string
	buttonPadding: string
	buttonPaddingTablet: string
	buttonPaddingMobile: string
	isSynced: string[]
}

export type FormOptions = {
	form?: string
	hasCaptcha?: boolean
	email?: string
	fromName?: string
	redirectLink?: string
	emailSubject?: string
	submitMessage?: string
	errorMessage?: string
	cc?: string
	bcc?: string
	autoresponder?: {
		subject?: string
		body?: string
	}
}

export type FormAttrs = Partial<Attributes>
export type FormProps = BlockProps<Attributes>
export interface FormInspectorProps extends InspectorProps<Attributes> {}
