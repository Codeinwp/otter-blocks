import { BlockProps } from "../../../helpers/blocks"

type Attributes = {
	id: string
	label: string
	placeholder: string
	isRequired: boolean
	mappedName: string
}

export type FormTextareaProps = BlockProps<Attributes>
