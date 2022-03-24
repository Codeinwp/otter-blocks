import { BlockProps, InspectorProps } from "../../helpers/blocks"

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
	inputPadding: number
	labelColor: string
	inputBorderRadius: number
	inputBorderColor: string
	inputBorderWidth: number
	inputWidth: number
	submitMessage: string
	submitMessageColor: string
	submitBackgroundColor: string
	submitBackgroundColorHover: string
	submitColor: string
}

export type FormProps = BlockProps<Attributes>
export interface FormInspectorProps extends InspectorProps<Attributes> {}
