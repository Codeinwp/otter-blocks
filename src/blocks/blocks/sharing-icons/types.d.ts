import { BlockProps, InspectorProps } from '../../helpers/blocks';

type Attributes = {
	id: string
	facebook: object | boolean
	twitter: object | boolean
	linkedin: object | boolean
	pinterest: object | boolean
	tumblr: object | boolean
	reddit: object | boolean
	whatsapp: object | boolean
	email: object | boolean
	mastodon: object | boolean
	comments: object | boolean
	telegram: object | boolean
	gap: number
	borderRadius: number
	textDeco: string
	backgroundColor: string
	textColor: string
	context: string
}

export type SharingIconsAttrs = Partial<Attributes>
export type SharingIconsProps = BlockProps<Attributes>
export interface SharingIconsInspectorProps extends InspectorProps<Attributes> {}
