import { BlockProps, InspectorProps, MarginType, PaddingType } from '../../helpers/blocks';

type Attributes = {
  id: string
  content: string
  tag: string
  align: string
  alignTablet: string
  alignMobile: string
  headingColor: string
  highlightColor: string
  highlightBackground: string
  fontSize: number | string
  fontSizeTablet: number | string
  fontSizeMobile: number | string
  fontFamily: string
  fontVariant: string
  fontStyle: string
  textTransform: string
  lineHeight: number
  letterSpacing: number | string
  textShadow: boolean
  textShadowColor: string
  textShadowColorOpacity: number
  textShadowBlur: number
  textShadowHorizontal: number
  textShadowVertical: number
  paddingType: string
  paddingTypeTablet: string
  paddingTypeMobile: string
  padding: number | PaddingType
  paddingTablet: number | PaddingType
  paddingMobile: number | PaddingType
  paddingTop: number
  paddingTopTablet: number
  paddingTopMobile: number
  paddingRight: number
  paddingRightTablet: number
  paddingRightMobile: number
  paddingBottom: number
  paddingBottomTablet: number
  paddingBottomMobile: number
  paddingLeft: number
  paddingLeftTablet: number
  paddingLeftMobile: number
  marginType: string
  marginTypeTablet: string
  marginTypeMobile: string
  margin: number | MarginType
  marginTablet: number | MarginType
  marginMobile: number | MarginType
  marginTop: number
  marginTopTablet: number
  marginTopMobile: number
  marginBottom: number
  marginBottomTablet: number
  marginBottomMobile: number
  linkColor: string
  linkHoverColor: string,
  backgroundColor: string
}

export type AdvancedHeadingAttrs = Partial<Attributes>
export type AdvancedHeadingProps = BlockProps<Attributes>
export interface AdvancedHeadingInspectorProps extends InspectorProps<Attributes> {}
