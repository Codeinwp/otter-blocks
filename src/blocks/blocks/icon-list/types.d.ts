import { BlockProps } from "../../helpers/blocks"

type Attributes= {
	id: string
	defaultLibrary: string
	defaultIconPrefix: string
	defaultIcon: string
	defaultContentColor: string
	defaultIconColor: string
	defaultSize: number
	gap: number
	horizontalAlign: string
}

export type IconListProps = BlockProps<Attributes>
