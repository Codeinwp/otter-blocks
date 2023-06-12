import { __ } from '@wordpress/i18n';
import { Button, Placeholder, Spinner, TextControl } from '@wordpress/components';
import './editor.scss';
import { Fragment } from '@wordpress/element';

type PromptPlaceholderProps = {
	title?: string
	description?: string
	value: string
	onValueChange: ( text: string ) => void
	onSubmit: () => void
	status?: 'default' | 'loading' | 'success' | 'error'
};

const PromptPlaceholder = ( props: PromptPlaceholderProps ) => {
	const { title, description, value, onValueChange, onSubmit, status } = props;

	return (
		<Placeholder
			className="prompt-placeholder"
			label={title ?? __( 'Generate Form', 'otter-blocks' )}
			instructions={description ?? __( 'Write what type of form do you want to have.', 'otter-blocks' )}
		>
			<TextControl value={value} onChange={onValueChange} />

			<div className="prompt-placeholder__submit">
				<Button
					variant="primary"
					onClick={onSubmit}
					isBusy={'loading' === status}
				>

					{ 'loading' !== status &&  __( 'Generate', 'otter-blocks' ) }
					{ 'loading' === status && (
						<Fragment>
							<span>{ __( 'Generating...', 'otter-blocks' ) }</span>
						</Fragment>
					) }
				</Button>
			</div>
		</Placeholder>
	);
};

export default PromptPlaceholder;
