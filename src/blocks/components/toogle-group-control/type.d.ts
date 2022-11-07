import { Icon } from '@wordpress/components';
import { CSSProperties } from 'react';

type Style = {
    group: CSSProperties,
    option: CSSProperties,
    button: CSSProperties,
    label: CSSProperties,
    active: CSSProperties
}

type Option = {
    label?: number | string
    value: number | string
    icon?: Icon.Props<any>['icon'] | undefined;
}

export type ToggleGroupControlProps = {
    value: number | string,
    options: Option[],
    onChange: ( value: number | string ) => void
    hasIcon?: boolean
}
