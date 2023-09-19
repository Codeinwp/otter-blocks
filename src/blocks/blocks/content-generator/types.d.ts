import { BlockProps, InspectorProps } from '../../helpers/blocks';

type Attributes = {
	promptID: string;
	resultHistory: {result: string, meta: { usedToken: number, prompt: string }}[]
}

export type ContentGeneratorAttrs = Partial<Attributes>
export type ContentGeneratorProps = BlockProps<Attributes>
export interface ContentGeneratorInspectorProps extends InspectorProps<Attributes> {}
