import { BlockProps, BorderRadius, BorderType, InspectorProps } from '../../../helpers/blocks';

type Attributes = {
  id: string
  text: string
  link: string
  newTab: string
  color: string
  background: string
  backgroundGradient: string
  border: string
  hoverColor: string
  hoverBackground: string
  hoverBackgroundGradient: string
  hoverBorder: string
  borderSize: number | BorderType
  borderRadius: number | BorderRadius
  boxShadow: boolean
  boxShadowColor: string
  boxShadowColorOpacity: number
  boxShadowBlur: number
  boxShadowSpread: number
  boxShadowHorizontal: number
  boxShadowVertical: number
  hoverBoxShadowColor: string
  hoverBoxShadowColorOpacity: number
  hoverBoxShadowBlur: number
  hoverBoxShadowSpread: number
  hoverBoxShadowHorizontal: number
  hoverBoxShadowVertical: number
  iconType: string
  library: string
  prefix: string
  icon: string
  noFollow: boolean
  isSynced: string[]
}

export type ButtonAttrs = Partial<Attributes>
export type ButtonGroupButtonProps = BlockProps<Attributes>
export interface ButtonGroupButtonInspectorProps extends InspectorProps<Attributes> {}
