import { BlockProps, InspectorProps } from "../../helpers/blocks"

type Attributes = {
	id: string
	style: string
	location: string
	latitude: string
	longitude: string
	type: string
	zoom: number
	height: number
	draggable: boolean
	zoomControl: boolean
	markers: {
		id: string
		latitude: number
		longitude: number
		title: string
		description: string
		location: string
	}[]
}

export type LeafletMapProps = BlockProps<Attributes>
export interface LeafletMapInspectorProps extends InspectorProps<Attributes> {}
