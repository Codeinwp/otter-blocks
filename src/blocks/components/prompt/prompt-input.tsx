/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { aiGeneration } from '../../helpers/icons';

type PromptInputProps = {
	value: string;
	onValueChange: ( value: string ) => void;
	status: string;
	onGenerate: () => void;
}
const PromptInput = ( props: PromptInputProps ) => {
	return (
		<div className="prompt-input__container">
			<div className="prompt-input__input__container">
				<Icon icon={aiGeneration} width={24} />
				<input className="prompt-input__input" value={ props.value } onChange={ ( e ) => props.onValueChange( e.target.value ) } />
			</div>
			<div className="prompt-input__submit__container">
				<Button
					variant="secondary"
					onClick={props.onGenerate}
					isBusy={'loading' === props.status}
					disabled={ 'loading' === props.status}
				>
					{__( 'Generate', 'otter-blocks' )}
				</Button>
			</div>
		</div>
	);
};

export default PromptInput;
