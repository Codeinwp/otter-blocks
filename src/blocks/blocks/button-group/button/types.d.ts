import { BlockProps, InspectorProps } from '../../../helpers/blocks'

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
  borderSize: number
  borderRadius: number
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
  type: string
}

export type ButtonGroupButtonProps = BlockProps<Attributes>
export interface ButtonGroupButtonInspectorProps extends InspectorProps<Attributes> {}
