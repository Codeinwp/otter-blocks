import { BlockProps, InspectorProps } from '../../helpers/blocks';

type Attributes = {
	promptID: string;
}

export type ContentGeneratorAttrs = Partial<Attributes>
export type ContentGeneratorProps = BlockProps<Attributes>
export interface ContentGeneratorInspectorProps extends InspectorProps<Attributes> {}
