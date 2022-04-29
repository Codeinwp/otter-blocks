import { BlockProps, InspectorProps } from "../../helpers/blocks"

type Attributes = {
	id: string
	facebook: boolean
	twitter: boolean
	linkedin: boolean
	pinterest: boolean
	tumblr: boolean
	reddit: boolean
	gap: number
	borderRadius: number
	textDeco: string
	backgroundColor: string
	textColor: string
}

export type SharingIconsProps = BlockProps<Attributes>
export interface SharingIconsInspectorProps extends InspectorProps<Attributes> {}
