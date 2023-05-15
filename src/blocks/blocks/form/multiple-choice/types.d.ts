import {
	BlockProps,
	InspectorProps
} from '../../../helpers/blocks';
import { FormInputCommonProps } from '../common';

type Attributes = FormInputCommonProps & {
	type: string
	inputWidth: number
	options: string,
	multipleSelection: boolean,
}

export type FormMultipleChoiceInputProps = BlockProps<Attributes>
export interface FormMultipleChoiceInputInspectorProps extends InspectorProps<Attributes> {}
