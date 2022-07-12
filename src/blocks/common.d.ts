import {BoxType} from "./helpers/blocks";

export type BoxShadow = {
    color: string
    colorOpacity: number
    blur: number
    spread: number
    horizontal: number
    vertical: number
}

export type BoxPadding = {
    left: string
    right: string
    top: string
    bottom: string
}

export type AdvancedBorder = {
	color: string
	style: string
	width: BoxType
}

export type BoxBorder = BoxPadding;

export type IconData = {
    library: string
    name: string
    prefix: string
}
