import { BlockProps } from '../../helpers/blocks'

type Attributes = {
	id: string
	title: string
	percentage: number
	duration: number
	titleStyle: string
	percentagePosition: string
	height: string
	borderRadius: number
	backgroundColor: string
	barBackgroundColor: string
	titleColor: string
	percentageColor: string
}

export type AboutAuthorProps = BlockProps<Attributes>
