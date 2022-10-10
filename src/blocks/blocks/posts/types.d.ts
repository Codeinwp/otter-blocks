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
	customTitleFontSizeTablet: number
	customTitleFontSizeMobile: number
	customDescriptionFontSize: number
	customDescriptionFontSizeTablet: number
	customDescriptionFontSizeMobile: number
	borderRadius: number|string
	borderWidth: string
	cardBorderRadius: string
	boxShadow: BoxShadow
	imageBoxShadow: BoxShadow
	textAlign: string
	verticalAlign: string
	enableFeaturedPost: boolean
	imageWidth: number|string
	imageWidthTablet: string
	imageWidthMobile: string
	columnGap: string
	columnGapTablet: string
	columnGapMobile: string
	rowGap: string
	rowGapTablet: string
	rowGapMobile: string
	padding: string
	paddingTablet: string
	paddingMobile: string
	contentGap: string
}

export type PostProps = BlockProps<Attributes>
export interface PostInspectorProps extends InspectorProps<Attributes> {}
