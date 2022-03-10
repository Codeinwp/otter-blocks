import { BlockProps } from "../../helpers/blocks"

type Attributes = {
	id: string
	reviews: string[]
	buttonColor: string
	buttonText: string
}

export type ReviewComparisionProps = BlockProps<Attributes>
