import { BlockProps } from '../../../helpers/blocks';

type Attributes = {
	title: string
	initialOpen: boolean
	tag: string
}

export type AccordionItemProps = BlockProps<Attributes>
