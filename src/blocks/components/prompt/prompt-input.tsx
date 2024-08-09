/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { Fragment, useEffect, useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { aiGeneration } from '../../helpers/icons';

type PromptInputProps = {
	value: string;
	onValueChange: ( value: string ) => void;
	placeholder?: string;
	status: string;
	onGenerate: () => void;
}
const PromptInput = ( props: PromptInputProps ) => {
	const inputRef = useRef<HTMLTextAreaElement|null>( null );

	/**
	 * Handle keydown event.
	 */
	const handleKeyDown = ( e: React.KeyboardEvent<HTMLTextAreaElement> ) => {
		if ( 'Enter' === e.key && ! e.shiftKey ) {
			e.preventDefault();
			props.onGenerate();
		}
	};

	return (
		<div className="prompt-input__container">
			<div className="prompt-input__input__container">
				<Icon icon={aiGeneration} width={24} />
				<textarea
					ref={ inputRef }
					className="prompt-input__input"

					onChange={ ( e ) => {
						props.onValueChange( e.target.value );

						if ( ! inputRef.current ) {
							return;
						}

						inputRef.current.style.cssText = 'height:auto; padding:0; overflow-y: hidden;';
						inputRef.current.style.cssText = 'height:' + inputRef.current.scrollHeight + 'px; overflow-y: auto;';
					} }
					placeholder={ props.placeholder }
					rows={1}
					onKeyDown={ handleKeyDown }
					value={ props.value }
				>
				</textarea>
				<div className="prompt-input__submit__container">
					<Button
						variant="secondary"
						onClick={props.onGenerate}
						isBusy={'loading' === props.status}
						disabled={ 'loading' === props.status ||  0 === props.value.length}
					>
						{__( 'Generate', 'otter-blocks' )}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default PromptInput;
