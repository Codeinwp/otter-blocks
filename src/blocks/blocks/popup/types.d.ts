import { BlockProps, BorderType, BoxShadow, InspectorProps, PaddingType } from '../../helpers/blocks';

type Attributes = {
	id: string
	minWidth: number
	maxWidth: number
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
	borderWidth: BorderType
	borderRadius: BorderType
	borderColor: string
	borderStyle: string
	padding: PaddingType
	paddingTablet: PaddingType
	paddingMobile: PaddingType
	width: string
	widthTablet: string
	widthMobile: string
	height: string
	heightTablet: string
	heightMobile: string
	verticalPosition: string
	horizontalPosition: string
	verticalPositionTablet: string
	horizontalPositionTablet: string
	verticalPositionMobile: string
	horizontalPositionMobile: string
	boxShadow: BoxShadow
	closeButtonType: 'outside'
	lockScrolling: boolean
}

export type PopupPros = BlockProps<Attributes>
export interface PopupInspectorProps extends InspectorProps<Attributes> {}
