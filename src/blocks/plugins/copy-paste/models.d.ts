import { BorderType, MarginType, PaddingType, ResponsiveProps } from '../../helpers/blocks';


interface SharedAttrs  {
    padding?: ResponsiveProps<PaddingType>
    margin?: ResponsiveProps<MarginType>
    border?: {
        width?: number
        radius?: ResponsiveProps<BorderType>
    }
    colors?: {
        background?: string
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
