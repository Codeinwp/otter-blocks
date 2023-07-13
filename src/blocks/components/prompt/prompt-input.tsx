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
	const inputRef = useRef<HTMLInputElement|null>( null );

	useEffect( () => {
		if ( inputRef.current ) {
			inputRef.current?.addEventListener(
				'keydown',
				( e ) => {
					if ( 'Enter' === e.key ) {
						e.preventDefault();
						props.onGenerate();
					}
				}
			);
		}
	}, []);

	return (
		<div className="prompt-input__container">
			<div className="prompt-input__input__container">
				<Icon icon={aiGeneration} width={24} />
				<input
					ref={ inputRef }
					className="prompt-input__input"
					value={ props.value }
					onChange={ ( e ) => props.onValueChange( e.target.value ) }
					placeholder={ props.placeholder }
				/>
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
