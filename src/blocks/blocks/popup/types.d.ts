import { BlockProps, InspectorProps } from "../../helpers/blocks"

type Attributes = {
	id: string
	minWidth: number
	trigger: string
	wait: number
	anchor: string
	scroll: number
	showClose: boolean
	outsideClose: boolean
	anchorClose: boolean
	closeAnchor: string
	recurringClose: number
	recurringTime: number
	backgroundColor: string
	closeColor: string
	overlayColor: string
	overlayOpacity: number
}

export type PopupPros = BlockProps<Attributes>
export interface PopupInspectorProps extends InspectorProps<Attributes> {}
