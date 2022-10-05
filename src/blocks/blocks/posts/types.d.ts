import { BlockProps, InspectorProps, BoxShadow } from '../../helpers/blocks';

type Attributes = {
	id: string
	style: string
	postTypes: string[]
	columns: number
	template: string[]
	categories: string[]
	postsToShow: number
	order: number
	orderBy: string
	offset: number
	imageSize: number
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
	borderWidth: number
	cardBorderRadius: number
	boxShadow: BoxShadow
	imageBoxShadow: BoxShadow
	textAlign: string
	verticalAlign: string
	enableFeaturedPost: boolean
	imageWidth: number
	columnGap: number
	columnGapTablet: number
	columnGapMobile: number
	rowGap: number
	rowGapTablet: number
	rowGapMobile: number
	padding: number
	paddingTablet: number
	paddingMobile: number
	contentGap: string
}

export type PostProps = BlockProps<Attributes>
export interface PostInspectorProps extends InspectorProps<Attributes> {}
