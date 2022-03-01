export type BlockProps<T> = {
	attributes: T
	setAttributes: ( attributes: Partial<T> ) => void
	isSelected: boolean
	clientId: string
	toggleSelection: (value: boolean) => void
}
