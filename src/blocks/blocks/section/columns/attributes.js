const attributes = {
	id: {
		type: 'string'
	},
	columns: {
		type: 'number'
	},
	layout: {
		type: 'string'
	},
	layoutTablet: {
		type: 'string',
		default: 'equal'
	},
	layoutMobile: {
		type: 'string',
		default: 'equal'
	},
	columnsGap: {
		type: 'string',
		default: 'default'
	},
	paddingType: {
		type: 'string',
		default: 'linked'
	},
	paddingTypeTablet: {
		type: 'string',
		default: 'linked'
	},
	paddingTypeMobile: {
		type: 'string',
		default: 'linked'
	},
	padding: {
		type: 'number',
		default: 20
	},
	paddingTablet: {
		type: 'number'
	},
	paddingMobile: {
		type: 'number'
	},
	paddingTop: {
		type: 'number',
		default: 20
	},
	paddingTopTablet: {
		type: 'number'
	},
	paddingTopMobile: {
		type: 'number'
	},
	paddingRight: {
		type: 'number',
		default: 20
	},
	paddingRightTablet: {
		type: 'number'
	},
	paddingRightMobile: {
		type: 'number'
	},
	paddingBottom: {
		type: 'number',
		default: 20
	},
	paddingBottomTablet: {
		type: 'number'
	},
	paddingBottomMobile: {
		type: 'number'
	},
	paddingLeft: {
		type: 'number',
		default: 20
	},
	paddingLeftTablet: {
		type: 'number'
	},
	paddingLeftMobile: {
		type: 'number'
	},
	marginType: {
		type: 'string',
		default: 'unlinked'
	},
	marginTypeTablet: {
		type: 'string',
		default: 'unlinked'
	},
	marginTypeMobile: {
		type: 'string',
		default: 'unlinked'
	},
	margin: {
		type: 'number',
		default: 20
	},
	marginTablet: {
		type: 'number'
	},
	marginMobile: {
		type: 'number'
	},
	marginTop: {
		type: 'number',
		default: 20
	},
	marginTopTablet: {
		type: 'number'
	},
	marginTopMobile: {
		type: 'number'
	},
	marginBottom: {
		type: 'number',
		default: 20
	},
	marginBottomTablet: {
		type: 'number'
	},
	marginBottomMobile: {
		type: 'number'
	},
	columnsWidth: {
		type: 'number'
	},
	horizontalAlign: {
		type: 'string',
		default: 'unset'
	},
	columnsHeight: {
		type: 'string',
		default: 'auto'
	},
	columnsHeightCustom: {
		type: 'number'
	},
	columnsHeightCustomTablet: {
		type: 'number'
	},
	columnsHeightCustomMobile: {
		type: 'number'
	},
	verticalAlign: {
		type: 'string',
		default: 'unset'
	},
	backgroundType: {
		type: 'string',
		default: 'color'
	},
	backgroundColor: {
		type: 'string'
	},
	backgroundImageID: {
		type: 'number'
	},
	backgroundImageURL: {
		type: 'string'
	},
	backgroundAttachment: {
		type: 'string',
		default: 'scroll'
	},
	backgroundPosition: {
		type: 'string',
		default: 'top left'
	},
	backgroundRepeat: {
		type: 'string',
		default: 'repeat'
	},
	backgroundSize: {
		type: 'string',
		default: 'auto'
	},
	backgroundGradient: {
		type: 'string',
		default: 'linear-gradient(90deg,rgba(54,209,220,1) 0%,rgba(91,134,229,1) 100%)'
	},
	backgroundOverlayOpacity: {
		type: 'number',
		default: 50
	},
	backgroundOverlayType: {
		type: 'string',
		default: 'color'
	},
	backgroundOverlayColor: {
		type: 'string'
	},
	backgroundOverlayImageID: {
		type: 'number'
	},
	backgroundOverlayImageURL: {
		type: 'string'
	},
	backgroundOverlayAttachment: {
		type: 'string',
		default: 'scroll'
	},
	backgroundOverlayPosition: {
		type: 'string',
		default: 'top left'
	},
	backgroundOverlayRepeat: {
		type: 'string',
		default: 'repeat'
	},
	backgroundOverlaySize: {
		type: 'string',
		default: 'auto'
	},
	backgroundOverlayGradient: {
		type: 'string',
		default: 'linear-gradient(90deg,rgba(54,209,220,1) 0%,rgba(91,134,229,1) 100%)'
	},
	backgroundOverlayFilterBlur: {
		type: 'number',
		default: 0
	},
	backgroundOverlayFilterBrightness: {
		type: 'number',
		default: 10
	},
	backgroundOverlayFilterContrast: {
		type: 'number',
		default: 10
	},
	backgroundOverlayFilterGrayscale: {
		type: 'number',
		default: 0
	},
	backgroundOverlayFilterHue: {
		type: 'number',
		default: 0
	},
	backgroundOverlayFilterSaturate: {
		type: 'number',
		default: 10
	},
	backgroundOverlayBlend: {
		type: 'string',
		default: 'normal'
	},
	borderType: {
		type: 'string',
		default: 'linked'
	},
	border: {
		type: 'number',
		default: 0
	},
	borderTop: {
		type: 'number',
		default: 0
	},
	borderRight: {
		type: 'number',
		default: 0
	},
	borderBottom: {
		type: 'number',
		default: 0
	},
	borderLeft: {
		type: 'number',
		default: 0
	},
	borderColor: {
		type: 'string',
		default: '#000000'
	},
	borderRadiusType: {
		type: 'string',
		default: 'linked'
	},
	borderRadius: {
		type: 'number',
		default: 0
	},
	borderRadiusTop: {
		type: 'number',
		default: 0
	},
	borderRadiusRight: {
		type: 'number',
		default: 0
	},
	borderRadiusBottom: {
		type: 'number',
		default: 0
	},
	borderRadiusLeft: {
		type: 'number',
		default: 0
	},
	boxShadow: {
		type: 'boolean',
		default: false
	},
	boxShadowColor: {
		type: 'string',
		default: '#000000'
	},
	boxShadowColorOpacity: {
		type: 'number',
		default: 50
	},
	boxShadowBlur: {
		type: 'number',
		default: 5
	},
	boxShadowSpread: {
		type: 'number',
		default: 0
	},
	boxShadowHorizontal: {
		type: 'number',
		default: 0
	},
	boxShadowVertical: {
		type: 'number',
		default: 0
	},
	dividerTopType: {
		type: 'string',
		default: 'none'
	},
	dividerTopColor: {
		type: 'string',
		default: '#000000'
	},
	dividerTopWidth: {
		type: 'number',
		default: 100
	},
	dividerTopWidthTablet: {
		type: 'number',
		default: 100
	},
	dividerTopWidthMobile: {
		type: 'number',
		default: 100
	},
	dividerTopHeight: {
		type: 'number',
		default: 100
	},
	dividerTopHeightTablet: {
		type: 'number',
		default: 100
	},
	dividerTopHeightMobile: {
		type: 'number',
		default: 100
	},
	dividerTopInvert: {
		type: 'boolean',
		default: false
	},
	dividerBottomType: {
		type: 'string',
		default: 'none'
	},
	dividerBottomColor: {
		type: 'string',
		default: '#000000'
	},
	dividerBottomWidth: {
		type: 'number',
		default: 100
	},
	dividerBottomWidthTablet: {
		type: 'number',
		default: 100
	},
	dividerBottomWidthMobile: {
		type: 'number',
		default: 100
	},
	dividerBottomHeight: {
		type: 'number',
		default: 100
	},
	dividerBottomHeightTablet: {
		type: 'number',
		default: 100
	},
	dividerBottomHeightMobile: {
		type: 'number',
		default: 100
	},
	dividerBottomInvert: {
		type: 'boolean',
		default: false
	},
	hide: {
		type: 'boolean',
		default: false
	},
	hideTablet: {
		type: 'boolean',
		default: false
	},
	hideMobile: {
		type: 'boolean',
		default: false
	},
	reverseColumnsTablet: {
		type: 'boolean',
		default: false
	},
	reverseColumnsMobile: {
		type: 'boolean',
		default: false
	},
	columnsHTMLTag: {
		type: 'string',
		default: 'div'
	}
};

export default attributes;
