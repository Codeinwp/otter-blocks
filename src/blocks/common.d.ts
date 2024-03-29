export type BoxShadow = {
	active: boolean
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

export type BoxBorder = BoxPadding;

export type IconData = {
    library: string
    name: string
    prefix: string
}

export type SyncAttrs<T> = keyof T
