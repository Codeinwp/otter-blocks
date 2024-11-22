import { __ } from '@wordpress/i18n';
import { Button, Notice, TextControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { plus } from '@wordpress/icons';
import apiFetch from '@wordpress/api-fetch';
import { useDispatch } from '@wordpress/data';
import { BUTTON_GROUP_STYLE } from './common';

const STATUSES = {
	SAVING: 'saving',
	NONE: 'none',
};

const AddSourceForm = ({ setSources, onCancel }) => {
	const [ apiURL, setApiURL ] = useState('');
	const [ accessKey, setAccessKey ] = useState('');
	const [ status, setStatus ] = useState(STATUSES.NONE);
	const [ error, setError ] = useState('');
	const { createNotice } = useDispatch('core/notices');

	const isSaving = STATUSES.SAVING === status;

	const addSource = () => {
		setStatus(STATUSES.SAVING);

		apiFetch({
			path: 'otter/v1/template-cloud/add-source',
			method: 'POST',
			accept: 'application/json',
			data: {
				url: apiURL,
				key: accessKey,
			}
		}).then((response) => {
			setStatus(STATUSES.NONE);
			setSources(response.sources);
			onCancel();
			createNotice(
				'success',
				__('Source added successfully', 'otter-blocks'),
				{
					isDismissible: true,
					type: 'snackbar'
				}
			);
		}).catch((e) => {
			setStatus(STATUSES.NONE);
			setError(e?.message ?? __('An unknown error occurred.', 'otter-blocks'));
		});
	};
	return (
		<>
			<TextControl
				type="text"
				label={__('API URL', 'otter-blocks')}
				value={apiURL}
				placeholder={'https://example.com/wp-json'}
				disabled={isSaving}
				onChange={value => setApiURL(value)}
			/>
			<TextControl
				type="text"
				label={__('Access Key', 'otter-blocks')}
				value={accessKey}
				placeholder={'•'.repeat(32)}
				disabled={isSaving}
				onChange={value => setAccessKey(value)}
			/>

			{error && <Notice status="error" isDismissible>{error}</Notice>}

			<div style={BUTTON_GROUP_STYLE}>
				<Button onClick={onCancel} variant="secondary" disabled={isSaving}>
					{__('Cancel', 'otter-blocks')}
				</Button>

				<Button
					variant="primary"
					disabled={isSaving || !apiURL || !accessKey}
					onClick={addSource}
					icon={plus}
				>
					{__('Add Source', 'otter-blocks')}
				</Button>
			</div>
		</>
	);
};

export default AddSourceForm;
