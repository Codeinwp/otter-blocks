import { BlockProps } from "../../helpers/blocks"

type Attributes = {
	id: string
	subject: string
	emailTo: string
	optionName: string
	hasCaptcha: boolean
	provider: string
	apiKey: string
	listId: string
	action: string
}

export type FormProps = BlockProps<Attributes>
