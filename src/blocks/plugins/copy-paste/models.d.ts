import { BorderType, MarginType, PaddingType, ResponsiveProps } from '../../helpers/blocks';


interface SharedAttrs  {
    padding?: ResponsiveProps<PaddingType>
    margin?: ResponsiveProps<MarginType>
    border?: {
        width?: string
        radius?: ResponsiveProps<BorderType>
    }
    colors?: {
        text?: string
        background?: string
        border?: string
    },
    font?: {
        size?: string
        family?: string
        variant?: string
        transform?: string
        style?: string
        lineHeight?: number,
        letterSpacing?: string,
        dropCap?: boolean
        align?: string
    }
    width?: ResponsiveProps<string>
    height?: ResponsiveProps<string>
    layout?: {
        type?: string,
        flexWrap?: string,
        justifyContent?: string,
        orientation?: string
        verticalAlignment?: string
    }
}

type Storage<T> = {
    shared?: SharedAttrs
    private?: T
}

type CopyPasteStorage = {
    shared?: SharedAttrs
    [key: string]: any
}
