import { BlockProps, BoxType, InspectorProps } from '../../../helpers/blocks';

type Attributes = {
    id: string
    titleColor: string
    titleBackgroundColor: string
    tabColor: string
    activeTitleColor: string
    activeTitleBackgroundColor: string
    activeBorderColor: string
    contentTextColor: string
    borderColor: string
    borderWidth: number | BoxType
    titleBorderWidth: BoxType
    borderRadius: BoxType
    titlePadding: BoxType
    contentPadding: BoxType
    titleFontSize: string
    tabsPosition: 'top' | 'left'
    titleTag: string
    titleAlignment: string
    isSynced: string[]
};

export type TabsGroupAttrs = Partial<Attributes>
export type TabsGroupProps = BlockProps<Attributes>
export interface TabsGroupInspectorProps extends InspectorProps<Attributes> {}
