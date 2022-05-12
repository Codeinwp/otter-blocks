export type BlockProps<T> = {
	attributes: T
	setAttributes: ( attributes: Partial<T> ) => void
	isSelected: boolean
	clientId: string
	name: string
	toggleSelection: (value: boolean) => void
}

export interface InspectorProps<T> {
	attributes: T
	setAttributes: ( attributes: Partial<T> ) => void
}
