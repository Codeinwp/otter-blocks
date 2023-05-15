import { BlockProps } from '../../../helpers/blocks';
import { FormInputCommonProps } from '../common';

type Attributes = FormInputCommonProps & {
	inputWidth: number
}

export type FormTextareaProps = BlockProps<Attributes>
