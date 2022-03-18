import { BlockProps } from "../../../helpers/blocks"

type Attributes = {
	id: string
	type: string
	label: string
	placeholder: string
	isRequired: boolean
	mappedName: string
	labelColor: string
	inputWidth: number
}

export type FormInputProps = BlockProps<Attributes>
