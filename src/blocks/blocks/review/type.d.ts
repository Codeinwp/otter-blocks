import { BlockProps, InspectorProps, MediaImageProps, PaddingType, BoxShadow } from '../../helpers/blocks';

type Attributes = {
	id: string
	title: string
	currency: string
	price: number
	discounted: number
	image: MediaImageProps
	description: string
	features: {title: string, rating: number, description: string}[]
	pros: string[]
	cons: string[]
	links: {label: string, href: string, isSponsored: boolean}[]
	prosLabel: string
	consLabel: string
	buttonsLabel: string
	imageWidth: number
	imageSize: string
	mainHeading: string
	subHeading: string
	contentFontSize: number
	primaryColor: string
	backgroundColor: string
	textColor: string
	buttonTextColor: string
	borderColor: string
	starsColor: string
	prosColor: string
	consColor: string
	padding: PaddingType
	paddingMobile: PaddingType
	paddingTablet: PaddingType
	borderWidth: number
	borderRadius: number
	boxShadow: BoxShadow
	isSynced: string[]
}

export type ReviewAttrs = Partial<Attributes>
export type ReviewProps = BlockProps<Attributes>
export interface ReviewInspectorProps extends InspectorProps<Attributes> {}
