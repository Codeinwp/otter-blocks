import { BlockProps } from '../../helpers/blocks';

type Attributes = {
	id: string
	label: string
	time: string
	backgroundColor: string
	labelColor: string
	timeColor: string
}

export type BusinessHoursItemAttrs = Partial<Attributes>
export type BusinessHoursItemProps = BlockProps<Attributes>
