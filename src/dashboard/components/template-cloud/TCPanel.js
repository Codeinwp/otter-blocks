import { Button, ExternalLink, Notice, PanelBody } from '@wordpress/components';
import { useEffect, useState, createInterpolateElement } from '@wordpress/element';
import { plus, rotateRight } from '@wordpress/icons';
import { useDispatch } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

import useSettings from '../../../blocks/helpers/use-settings';
import { BUTTON_GROUP_STYLE, STATUSES } from './common';
import AddSourceForm from './AddSourceForm';
import Sources from './Sources';

const TCPanel = () => {
	const [ getOption ] = useSettings();
	const [ sources, setSources ] = useState([]);
	const [ isAdding, setIsAdding ] = useState(false);
	const [ status, setStatus ] = useState(STATUSES.NONE);
	const [ syncErrors, setSyncErrors ] = useState([]);

	const { createNotice } = useDispatch('core/notices');

	useEffect(() => {
		setSources(getOption('themeisle_template_cloud_sources'));
	}, [ getOption('themeisle_template_cloud_sources') ]);

	const syncSources = () => {
		setStatus(STATUSES.SYNCING);

		apiFetch({
			path: 'otter/v1/template-cloud/sync',
		}).then((response) => {
			const { sources, errors } = response;

			setSources(sources);
			setStatus(STATUSES.NONE);

			if (errors.length > 0) {
				setSyncErrors(errors);
			}

			createNotice(
				'success',
				__('Sources synced successfully.', 'otter-blocks'),
				{
					isDismissible: true,
					type: 'snackbar'
				}
			);

		}).catch((e) => {
			setStatus(STATUSES.NONE);
			setSyncErrors([ e?.message ?? __('An unknown error occurred.', 'otter-blocks') ]);
		});
	};

	const clearErrors = () => {
		setSyncErrors([]);
	};

	const toggleAdding = () => {
		setIsAdding(!isAdding);
	};

	const isSyncing = STATUSES.SYNCING === status;

	return <>
		<PanelBody
			title={__('Template Cloud', 'otter-blocks')}
			initialOpen={false}
		>
			<div className="tc-panel-content-wrap">
				{sources.length < 1 && !isAdding && (
					<div className="tc-sources-empty">
						<h4>{__('No sources found', 'otter-blocks')}</h4>
						<Button variant="primary" onClick={toggleAdding} icon={plus}>
							{__('Add Source', 'otter-blocks')}
						</Button>
					</div>
				)}

				{sources.length > 0 && (
					<Sources
						isSyncing={isSyncing}
						sourcesData={sources}
						setSources={setSources}
					/>
				)}

				{isAdding && (
					<AddSourceForm onCancel={toggleAdding} setSources={setSources}/>
				)}

				{!isAdding && sources.length > 0 && (
					<>
						{syncErrors.length > 0 && (
							<Notice status="error" isDismissible onDismiss={clearErrors}>
								{syncErrors.map((error, index) => (
									<p key={index}>{error}</p>
								))}
							</Notice>
						)}

						<div style={BUTTON_GROUP_STYLE}>
							<Button variant="secondary" onClick={syncSources} icon={rotateRight} disabled={isSyncing}>
								{isSyncing ? __('Syncing', 'otter-blocks') : __('Sync Sources', 'otter-blocks')}
							</Button>
							<Button variant="primary" disabled={isSyncing} onClick={toggleAdding} icon={plus}>
								{__('Add Source', 'otter-blocks')}
							</Button>
						</div>
					</>
				)}

				{ typeof createInterpolateElement !== 'undefined' && (<>
					<p className="description">
						{createInterpolateElement(
							/* translators: %s: External Link */
							__('Check-out our curated list of sources that you can import <tcLink/>.', 'otter-blocks'),
							{
								tcLink: <ExternalLink
									href={otterObj.tcDocs}>{__('here', 'otter-blocks')}</ExternalLink>
							}
						)}
					</p>

					{sources.length < 1 && <p className="description">
						{createInterpolateElement(
							/* translators: %1$s: `Otter Pro Agency` link, %2$s: `Templates Cloud` link */
							__('Want to share your patterns across multiple sites? Get <otterLink/> or the <tcLink/> plugin to unlock the pattern sharing capabilities!', 'otter-blocks'),
							{
								otterLink: <ExternalLink
									href={otterObj.upgradeLinkFromTc}>{__('Otter PRO Agency', 'otter-blocks')}</ExternalLink>,
								tcLink: <ExternalLink
									href={otterObj.tcUpgradeLink}>{__('Templates Cloud', 'otter-blocks')}</ExternalLink>
							}
						)}
					</p>}
				</>
				)}
			</div>
		</PanelBody>
	</>;

};

export default TCPanel;
