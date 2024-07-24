import { BlockProps, InspectorProps } from '../../helpers/blocks';

type Attributes = {
	promptID: string;
	resultHistory: {result: string, meta: { usedToken: number, prompt: string }}[]

	/**
	 * The block identifier for replace action. (Used by AI Toolbar actions).
	 */
	replaceTargetBlock: Pick<BlockProps<unknown>, 'clientId' | 'name'>;
}

export type ContentGeneratorAttrs = Partial<Attributes>
export type ContentGeneratorProps = BlockProps<Attributes>
export interface ContentGeneratorInspectorProps extends InspectorProps<Attributes> {}
