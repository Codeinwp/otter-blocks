import { BlockProps } from "../../helpers/blocks"

type Attributes = {
	id: string
	title: string
	titleAlignment: string
	titleFontSize: number
	titleColor: string
	itemsFontSize: number
	backgroundColor: string
	gap: number
	borderWidth: number
	borderColor: string
	borderRadius: number
}

export type BusinessHoursProps = BlockProps<Attributes>
