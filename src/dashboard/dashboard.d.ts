type BlockToDisableData = {
    slug: string,
    name: string,
    icon: string | ( () => JSX.Element ),
    docLink?: string,
    isPro?: boolean,
    isDisabled?: boolean,
}

export type BlocksToDisableList = BlockToDisableData[]

export type BlockCardHeaderProps = {
    blocks: BlocksToDisableList,
    onDisableAll: () => void,
    onEnableAll: () => void,
}

export type BlockCardProps = {
    block: BlockToDisableData,
    isLoading: boolean,
    onToggle: () => void,
}
