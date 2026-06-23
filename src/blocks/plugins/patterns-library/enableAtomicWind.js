/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { Button } from '@wordpress/components';

import { Icon, layout, update } from '@wordpress/icons';

import { useState } from '@wordpress/element';

/**
 * Internal dependencies.
 */
import useSettings from '../../helpers/use-settings';

const ATOMIC_WIND_OPTION = 'themeisle_blocks_settings_atomic_wind_blocks';

/**
 * Gate shown in place of the library when the Atomic Wind blocks — which every
 * template is built on — are disabled. Lets the user flip the setting in one
 * click, then asks for the reload the new block registrations need to load.
 */
const EnableAtomicWind = () => {
	const [ , updateOption, status ] = useSettings();
	const [ enabled, setEnabled ] = useState(false);

	const isSaving = 'saving' === status;

	const enable = () => {
		updateOption(
			ATOMIC_WIND_OPTION,
			true,
			__('Atomic Wind blocks enabled.', 'otter-blocks'),
			'o-library-atomic-wind',
			() => setEnabled(true),
		);
	};

	return (
		<div className="o-library__gate">
			<span className="o-library__gate-icon">
				<Icon icon={enabled ? update : layout} size={40} />
			</span>

			{!enabled ? (
				<>
					<h2>{__('Atomic Wind blocks are required', 'otter-blocks')}</h2>
					<p>
						{__(
							'The Design Library is built on Otter\'s Atomic Wind blocks, which are currently disabled. Enable them to browse and insert templates.',
							'otter-blocks',
						)}
					</p>
					<Button
						variant="primary"
						className="o-library__gate-action"
						onClick={enable}
						isBusy={isSaving}
						disabled={isSaving}
					>
						{isSaving
							? __('Enabling…', 'otter-blocks')
							: __('Enable Atomic Wind blocks', 'otter-blocks')}
					</Button>
				</>
			) : (
				<>
					<h2>{__('Almost there — reload to continue', 'otter-blocks')}</h2>
					<p>
						{__(
							'Atomic Wind blocks are now enabled. Reload the editor to load them, then reopen the Design Library. Save any pending changes first.',
							'otter-blocks',
						)}
					</p>
					<Button
						variant="primary"
						className="o-library__gate-action"
						onClick={() => window.location.reload()}
					>
						{__('Reload editor', 'otter-blocks')}
					</Button>
				</>
			)}
		</div>
	);
};

export default EnableAtomicWind;
