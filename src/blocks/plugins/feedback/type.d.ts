import { Button } from '@wordpress/components';
import ButtonVariant = Button.ButtonVariant;

export type FeedbackStatus = 'notSubmitted' | 'loading' | 'emptyFeedback' | 'error' | 'submitted';

export type FeedbackModalProps = {
	source: string
	text: string
	variant: ButtonVariant
}

export type FeedbackFormProps = {
	source: string,
	status: FeedbackStatus,
	setStatus: ( value: FeedbackStatus ) => void
}
