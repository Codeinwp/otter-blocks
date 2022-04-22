import { BlockProps } from "../../../helpers/blocks"

type Attributes = {
	title: string
	initialOpen: boolean
}

export type AccordionItemProps = BlockProps<Attributes>
