import { BlockProps, InspectorProps } from "../../helpers/blocks"

type Attributes = {
	facebook: boolean
	twitter: boolean
	linkedin: boolean
	pinterest: boolean
	tumblr: boolean
	reddit: boolean
}

export type SharingIconsProps = BlockProps<Attributes>
export interface SharingIconsInspectorProps extends InspectorProps<Attributes> {}
