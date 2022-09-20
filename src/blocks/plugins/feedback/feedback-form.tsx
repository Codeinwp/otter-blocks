/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	useEffect,
	useState
} from '@wordpress/element';
import {
	Button,
	Spinner,
	TextareaControl
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal Dependencies
 */
import './editor.scss';

const { version } = window.themeisleGutenberg ? window.themeisleGutenberg : window.otterObj;

const collectedInfo = [
	{
		name: __( 'Plugin version',  'otter-blocks' ),
		value: version
	},
	{
		name: __( 'Feedback', 'otter-blocks' ),
		value: __( 'Text from the above text area', 'otter-blocks' )
	}
];

/**
 * Displays a button that opens a modal for sending feedback
 *
 * @param source The area from where the feedback is given
 * @param status
 * @param setStatus
 * @returns
 */
const FeedbackForm = ({
	source,
	status,
	setStatus
}): JSX.Element => {
	const [ feedback, setFeedback ] = useState( '' );
	const [ showInfo, setShowInfo ] = useState( false );

	useEffect( () => {
		const info = document.querySelector( '.o-feedback-form .info' ) as HTMLElement;
		if ( info ) {
			info.style.height = showInfo ? `${ info.querySelector( '.wrapper' ).clientHeight }px` : '0';
		}

	}, [ showInfo ]);

	const sendFeedback = () => {
		const trimmedFeedback = feedback.trim();
		if ( 5 >= trimmedFeedback.length ) {
			setStatus( 'emptyFeedback' );
			return;
		}

		setStatus( 'loading' );
		fetch( 'https://api.themeisle.com/tracking/feedback', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				slug: 'otter-blocks',
				version: version,
				feedback: trimmedFeedback,
				data: {
					'feedback-area': source
				}
			})
		}).then( r => {
			if ( ! r.ok ) {
				setStatus( 'error' );
				return;
			}

			setStatus( 'submitted' );
		});
	};

	const helpTextByStatus = {
		'error': __( 'There has been an error. Your feedback couldn\'t be sent.' ),
		'emptyFeedback': __( 'Please provide a feedback before submitting the form.', 'otter-blocks' )
	};

	return (
		<form
			className="o-feedback-form"
			onSubmit={ e => {
				e.preventDefault();
				sendFeedback();
			} }
		>
			<TextareaControl
				className={ classnames({
					'invalid': 'emptyFeedback' === status,
					'f-error': 'error' === status
				}) }
				placeholder={ __( 'Tell us how can we help you better with Otter Blocks', 'otter-blocks' ) }
				value={ feedback }
				rows={7}
				cols={50}
				onChange={ value => {
					setFeedback( value );
					if ( 5 < value.trim().length ) {
						setStatus( 'notSubmitted' );
					}
				} }
				help={ helpTextByStatus[status] || false }
				autoFocus
			/>
			<div className="info">
				<div className="wrapper">
					<p>{ __( 'We value privacy, that\'s why no domain name, email address or IP addresses are collected after you submit the survey. Below is a detailed view of all data that Themeisle will receive if you fill in this survey.', 'otter-blocks' ) }</p>
					{ collectedInfo.map( ( row, index ) => {
						return (
							<div className="info-row" key={ index }>
								<p><b>{ row.name }</b></p>
								<p>{ row.value }</p>
							</div>
						);
					}) }
				</div>
			</div>
			<div className="buttons-wrap">
				<Button
					className="toggle-info"
					aria-expanded={ showInfo }
					variant="link"
					isLink
					onClick={() => setShowInfo( ! showInfo )}
				>
					{ __( 'What info do we collect?', 'otter-blocks' ) }
				</Button>
				<Button
					className="f-send"
					variant="primary"
					type="submit"
					isPrimary
					disabled={ 'loading' === status }
				>
					{ 'loading' === status ? <Spinner/> : __( 'Send feedback', 'otter-blocks' ) }
				</Button>
			</div>
		</form>
	);
};

export default FeedbackForm;
