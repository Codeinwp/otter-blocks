import { BlockProps, InspectorProps } from '../../helpers/blocks'

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
  fontSize: number
  fontSizeTablet: number
  fontSizeMobile: number
  fontFamily: number
  fontVariant: number
  fontStyle: string
  textTransform: string
  lineHeight: number
  letterSpacing: number
  textShadow: boolean
  textShadowColor: string
  textShadowColorOpacity: number
  textShadowBlur: number
  textShadowHorizontal: number
  textShadowVertical: number
  paddingType: string
  paddingTypeTablet: string
  paddingTypeMobile: string
  padding: number
  paddingTablet: number
  paddingMobile: number
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
  margin: number
  marginTablet: number
  marginMobile: number
  marginTop: number
  marginTopTablet: number
  marginTopMobile: number
  marginBottom: number
  marginBottomTablet: number
  marginBottomMobile: number
}

export type AdvancedHeadingProps = BlockProps<Attributes>
export interface AdvancedHeadingInspectorProps extends InspectorProps<Attributes> {}
