import { BlockProps, InspectorProps } from "../../helpers/blocks"

type Attributes = {
	id: string
	style: string
	postTypes: string[]
	columns: number
	template: string[]
	customMetas: {id: string, field: string, display: true}[]
	categories: string[]
	postsToShow: number
	order: number
	orderBy: string
	offset: number
	imageSize: number
	imageBoxShadow: boolean
	displayFeaturedImage: boolean
	displayCategory: boolean
	displayTitle: boolean
	titleTag: string
	displayMeta: boolean
	displayDescription: boolean
	excerptLength: number
	displayDate: boolean
	displayAuthor: boolean
	displayComments: boolean
	displayPostCategory: boolean
	displayReadMoreLink: boolean
	cropImage: boolean
	customTitleFontSize: number
	customTitleFontSizeTable: number
	customTitleFontSizeMobile: number
	customDescriptionFontSize: number
	customDescriptionFontSizeTablet: number
	customDescriptionFontSizeMobile: number
	borderRadius: number
	textAlign: string
	verticalAlign: string
	enableFeaturedPost: boolean
	imageWidth: number
}

export type PostProps = BlockProps<Attributes>
export interface PostInspectorProps extends InspectorProps<Attributes> {}
