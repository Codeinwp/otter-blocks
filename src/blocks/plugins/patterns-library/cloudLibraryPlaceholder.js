import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { cloud, Icon } from '@wordpress/icons';

export default () => (
	<div className="o-library__tc-placeholder">
		<Icon icon={cloud} size={40} />

		<h2>{__('Add External Sources', 'otter-blocks')}</h2>

		<div>
			<p>{__('Import templates from any site using Templates Cloud.', 'otter-blocks')}</p>
			<p>{__('Share patterns between your own sites.', 'otter-blocks')}</p>
		</div>

		<br/>

		<Button
			href={`${window.themeisleGutenberg.optionsPath}&scrollTo=tc#integrations`}
			variant='link'
		>
			{__('Go to settings to add sources', 'otter-blocks')}
		</Button>
	</div>
);
