const flushPromises = () => new Promise( resolve => setTimeout( resolve, 0 ) );

const loadCssHandler = ({ apiFetchImplementation, editorState = {}, widgetsState = null } = {}) => {
	jest.resetModules();

	const createNotice = jest.fn();
	const apiFetch = jest.fn( apiFetchImplementation || (() => Promise.resolve({}) ) );
	let subscriber;

	const defaultEditorState = {
		isCurrentPostPublished: () => true,
		isSavingPost: () => true,
		isPublishingPost: () => false,
		isAutosavingPost: () => false,
		getCurrentPostId: () => 123,
		__experimentalIsSavingReusableBlock: () => false,
		...editorState
	};

	jest.doMock( '@wordpress/i18n', () => ({
		__: text => text
	}), { virtual: true } );

	jest.doMock( 'lodash', () => ({
		debounce: fn => fn
	}) );

	jest.doMock( '@wordpress/api-fetch', () => apiFetch, { virtual: true } );

	jest.doMock( '@wordpress/data', () => ({
		dispatch: jest.fn( store => {
			if ( 'core/notices' === store ) {
				return { createNotice };
			}

			return {};
		}),
		select: jest.fn( store => {
			if ( 'core/edit-widgets' === store ) {
				return widgetsState;
			}

			if ( 'core/editor' === store ) {
				return defaultEditorState;
			}

			if ( 'core/block-editor' === store ) {
				return {
					getSettings: () => ({ __experimentalReusableBlocks: [] })
				};
			}

			if ( 'core' === store ) {
				return {
					isSavingEntityRecord: () => false
				};
			}

			return {};
		}),
		subscribe: jest.fn( callback => {
			subscriber = callback;
			return jest.fn();
		})
	}), { virtual: true } );

	window.themeisleGutenberg = { isBlockEditor: true };
	window.oTrk = { base: { uploadEvents: jest.fn() }};

	require( '../../plugins/css-handler' );

	return {
		apiFetch,
		createNotice,
		runSubscriber: async() => {
			subscriber();
			await flushPromises();
		}
	};
};

describe( 'CSS handler notices', () => {
	afterEach( () => {
		delete window.themeisleGutenberg;
		delete window.oTrk;
	});

	it( 'does not show progress or success notices when post CSS saves successfully', async() => {
		const { apiFetch, createNotice, runSubscriber } = loadCssHandler();

		await runSubscriber();

		expect( apiFetch ).toHaveBeenCalledWith({ path: 'otter/v1/post_styles/123', method: 'POST' });
		expect( createNotice ).not.toHaveBeenCalled();
	});

	it( 'shows an error notice when post CSS saving fails', async() => {
		const { createNotice, runSubscriber } = loadCssHandler({
			apiFetchImplementation: () => Promise.reject( new Error( 'CSS failed.' ) )
		});

		await runSubscriber();

		expect( createNotice ).toHaveBeenCalledWith(
			'error',
			'CSS failed.',
			{
				isDismissible: true,
				type: 'snackbar',
				id: 'saving-css'
			}
		);
	});

	it( 'does not show progress or success notices when widget CSS saves successfully', async() => {
		const widgetsState = {
			isSavingWidgetAreas: () => true,
			getEditedWidgetAreas: () => [ 'sidebar-1' ]
		};

		const { apiFetch, createNotice, runSubscriber } = loadCssHandler({ widgetsState });

		await runSubscriber();

		expect( apiFetch ).toHaveBeenCalledWith({ path: 'otter/v1/widget_styles', method: 'POST' });
		expect( createNotice ).not.toHaveBeenCalled();
	});

	it( 'shows an error notice when widget CSS saving fails', async() => {
		const widgetsState = {
			isSavingWidgetAreas: () => true,
			getEditedWidgetAreas: () => [ 'sidebar-1' ]
		};

		const { createNotice, runSubscriber } = loadCssHandler({
			widgetsState,
			apiFetchImplementation: () => Promise.reject( new Error( 'Widget CSS failed.' ) )
		});

		await runSubscriber();

		expect( createNotice ).toHaveBeenCalledWith(
			'error',
			'Widget CSS failed.',
			{
				isDismissible: true,
				type: 'snackbar',
				id: 'saving-css'
			}
		);
	});
});
