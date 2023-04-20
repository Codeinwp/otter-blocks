
import { FormInputCommonProps } from '../../../blocks/blocks/form/common';
import { BlockProps, InspectorProps } from '../../../blocks/helpers/blocks';


type Attributes = FormInputCommonProps & {
	type: string
	inputWidth: number
	maxFileSize: string
	allowedFileTypes: string[]
	multipleFiles: boolean
	fieldOptionName: string
	maxFilesNumber: number
	saveFiles: string
}

export type FormFileProps = BlockProps<Attributes>
export interface FormFileInspectorProps extends InspectorProps<Attributes> {}

