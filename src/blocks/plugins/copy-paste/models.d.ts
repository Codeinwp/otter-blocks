import { BorderRadius, BorderType, MarginType, PaddingType, ResponsiveProps } from '../../helpers/blocks';


interface SharedAttrs  {
    padding?: ResponsiveProps<PaddingType>
    margin?: ResponsiveProps<MarginType>
    border?: {
        width?: BorderType
        radius?: ResponsiveProps<BorderRadius>
    }
    colors?: {
        text?: string
        background?: string
        backgroundGradient?: string
        border?: string
        shadow?: string
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

    // Not sure if shadow deserve to shared since not many block use it.
    shadow?: {
        active?: boolean
        colorOpacity?: string
        blur?: string
        spread?: string
        horizontal?: string
        vertical?: string
    }
    type?: {
        background?: string
    }
}

type SharedCore = {
    textColor?: string,
    backgroundColor?: string
    gradient?: string
}

type Storage<T> = {
    shared?: SharedAttrs
    core?: SharedCore
    private?: T
}

type CopyPasteStorage = {
    copiedBlock?: string
    shared?: SharedAttrs
    core?: SharedCore
    private?: any
}
