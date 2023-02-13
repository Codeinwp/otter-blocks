export type ColorDropdownControlProps = Partial<{
    label: string
    colorValue: string
    gradientValue: string
    onColorChange: ( color: string ) => void
    onGradientChange: ( color: string ) => void
    className: string
}>
