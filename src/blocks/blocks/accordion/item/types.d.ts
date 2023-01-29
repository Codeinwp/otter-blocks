import { BlockProps } from '../../../helpers/blocks';

type Attributes = {
	placeholder: string;
	title: string
	initialOpen: boolean
	tag: string
}

export type AccordionItemProps = BlockProps<Attributes>
