import { BlockProps } from "../../../helpers/blocks"

type Attributes = {
	id: string
	type: string
	label: string
	placeholder: string
	isRequired: boolean
	mappedName: string
}

export type FormInputProps = BlockProps<Attributes>
