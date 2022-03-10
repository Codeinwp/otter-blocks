export type BlockProps<T> = {
	attributes: T
	setAttributes: ( attributes: Partial<T> ) => void
	isSelected: boolean
	clientId: string
	name: string
	toggleSelection: (value: boolean) => void
}

export type ImagePosition = {
	x: number,
	y: number
}

export type MediaImageProps = {
	id: number,
	url: string,
	alt: string
}
