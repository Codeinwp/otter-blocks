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
	mapTypeControl: boolean
	zoomControl: boolean
	fullscreenControl: boolean
	streetViewControl: boolean
	markers: {
		id: string
		latitude: number
		longitude: number
		title: string
		description: string
		location: string
	}[]
}

export type GoogleMapProps = BlockProps<Attributes>
export interface GoogleMapInspectorProps extends InspectorProps<Attributes> {}
