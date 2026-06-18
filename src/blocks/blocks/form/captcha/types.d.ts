import { BlockProps, InspectorProps } from '../../../helpers/blocks';

type Attributes = {
	provider: string
}

export type FormCaptchaProps = BlockProps<Attributes>;
export type FormCaptchaInspectorProps = InspectorProps<Attributes>;
