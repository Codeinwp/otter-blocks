import { BlockProps, InspectorProps } from "../../helpers/blocks"

type Attributes = {
	id: string
	facebook: object
	twitter: object
	linkedin: object
	pinterest: object
	tumblr: object
	reddit: object
	gap: number
	borderRadius: number
	textDeco: string
	backgroundColor: string
	textColor: string
}

export type SharingIconsProps = BlockProps<Attributes>
export interface SharingIconsInspectorProps extends InspectorProps<Attributes> {}
