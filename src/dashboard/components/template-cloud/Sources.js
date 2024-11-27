import { BaseControl, Button, Notice } from '@wordpress/components';
import { trash } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';

const Sources = ({ sourcesData, setSources, isSyncing }) => {
	const { createNotice } = useDispatch('core/notices');
	const [ error, setError ] = useState('');

	const deleteSource = (key) => {
		// eslint-disable-next-line no-alert
		const confirm = window.confirm(__('Are you sure you want to delete this source?', 'otter-blocks'));

		if (!confirm) {
			return;
		}

		apiFetch({
			path: `otter/v1/template-cloud/delete-source/${key}`,
			method: 'DELETE',
			accept: 'application/json',
		}).then((response) => {
			setSources(response.sources);
			createNotice(
				'success',
				__('Source deleted', 'otter-blocks'),
				{
					isDismissible: true,
					type: 'snackbar'
				}
			);
		}).catch((e) => {
			setError(e?.message ?? __('An unknown error occurred.', 'otter-blocks'));
		});
	};

	return (
		<>
			<table className="tc-table">
				<thead>
					<tr>
						<td>{ __('Name', 'otter-blocks' )}</td>
						<td>{ __('Source URL', 'otter-blocks' )}</td>
						<td>{ __('Actions', 'otter-blocks' )}</td>
					</tr>
				</thead>
				<tbody>
					{sourcesData.map((source) => {
						const displayURL = new URL(source.url).hostname;
						return (
							<tr key={source.key}>
								<td>
									{source.name}
								</td>
								<td>
									{displayURL}
								</td>
								<td>
									<Button
										disabled={isSyncing}
										variant="primary"
										size="compact"
										isDestructive
										icon={trash}
										onClick={() => {
											deleteSource(source.key);
										}}
										text={__('Remove', 'otter-blocks')}
									/>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>

			{error && <Notice status="error" isDismissible onDismiss={() => {
				setError('');
			}}>{error}</Notice>}
		</>
	);
};

export default Sources;
