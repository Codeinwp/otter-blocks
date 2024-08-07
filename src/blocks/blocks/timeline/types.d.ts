import type {  BlockProps, BorderRadius, InspectorProps, BoxType  } from '../../helpers/blocks';

type CommonAttributes = {
    id: string
    containerBackgroundColor: string
    containerBorder: BoxType
    containerBorderColor: string
    containerRadius: BorderRadius
    iconColor: string
}

type ItemAttributes = CommonAttributes & {
    hasIcon: boolean
    iconType: string
    icon: string
    iconPrefix: string
}

type GroupAttributes = CommonAttributes & {
    containerRadius: BorderRadius
    containerPadding: BorderRadius
    iconSize: string
    verticalLineColor: string
    verticalLineWidth: string
    containersAlignment: string
};

export type TimelineGroupAttrs = Partial<GroupAttributes>
export type TimelineGroupProps = BlockProps<GroupAttributes>
export interface TimelineGroupInspectorProps extends InspectorProps<GroupAttributes> {}

export type TimelineItemAttrs = Partial<ItemAttributes>
export type TimelineItemProps = BlockProps<ItemAttributes>
export interface TimelineItemInspectorProps extends InspectorProps<ItemAttributes> {}
