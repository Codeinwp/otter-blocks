import { BlockProps, InspectorProps } from '../../helpers/blocks';

type Attributes = {
	product: string
	price: string
	successMessage: string
	cancelMessage: string
	autoresponder: {
		subject: string
		body: string
	}
}

export type StripeCheckoutProps = BlockProps<Attributes>
export interface StripeCheckoutInspectorProps extends InspectorProps<Attributes> {}
