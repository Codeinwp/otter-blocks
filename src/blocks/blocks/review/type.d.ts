import { BlockProps, InspectorProps, MediaImageProps } from '../../helpers/blocks'

type Attributes = {
	id: string
	title: string
	currency: string
	price: number
	discounted: number
	image: MediaImageProps
	description: string
	features: {title: string, rating: number}[]
	pros: string[]
	cons: string[]
	links: {label: string, href: string, isSponsored: boolean}[]
	primaryColor: string
	backgroundColor: string
	textColor: string
	buttonTextColor: string
	isSynced: string[]
}

export type ReviewProps = BlockProps<Attributes>
export interface ReviewInspectorProps extends InspectorProps<Attributes> {}
