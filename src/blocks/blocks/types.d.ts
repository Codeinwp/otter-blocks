import type {  BlockProps, BorderRadius, BoxType, CoreBorderRadiusType, CoreBorderType, InspectorProps  } from '../helpers/blocks';

type Attributes = {
    id: string
    containerBackgroundColor: string
    containerBorder: CoreBorderType
    containerRadius: BorderRadius
    containerPadding: BorderRadius
    iconColor: string
    iconSize: string
    verticalLineColor: string
    verticalLineWidth: string
    containersAlignment: string
    hasIcon: boolean
};

export type TimelineGroupAttrs = Partial<Attributes>
export type TimelineGroupProps = BlockProps<Attributes>
export interface TimelineGroupInspectorProps extends InspectorProps<Attributes> {}
