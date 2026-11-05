/**
 * @return {{ onFinish: ( target?: Event ) => void, setPreference: jest.Mock }} Guide's finish handler and the preference setter.
 */
const renderWelcomeGuide = () => {
	jest.resetModules();

	/** @type {import('react').FunctionComponent|undefined} */
	let Render;

	/** @type {{ onFinish: ( target?: Event ) => void }|undefined} */
	let guideProps;

	const setPreference = jest.fn();

	jest.doMock( '@wordpress/i18n', () => ({
		__: text => text
	}), { virtual: true } );

	jest.doMock( '@wordpress/components', () => ({
		CheckboxControl: () => null,
		ExternalLink: () => null,
		TextControl: () => null,
		Guide: props => {
			guideProps = props;
			return null;
		}
	}), { virtual: true } );

	jest.doMock( '@wordpress/plugins', () => ({
		registerPlugin: ( name, settings ) => {
			Render = settings.render;
		}
	}), { virtual: true } );

	const stores = {
		'core': {
			getCurrentUser: () => ({ id: 1 }),
			getUser: () => undefined,
			getSite: () => undefined
		},
		'core/editor': {},
		'core/edit-post': {
			isFeatureActive: () => false
		},
		'themeisle-gutenberg/data': {
			isOnboardingVisible: () => true
		}
	};

	const dispatchers = {
		'core/notices': { createNotice: jest.fn() },
		'core/preferences': { set: setPreference },
		'themeisle-gutenberg/data': { showOnboarding: jest.fn() }
	};

	jest.doMock( '@wordpress/data', () => ({
		select: store => stores[ store ],
		useSelect: mapSelect => mapSelect( store => stores[ store ]),
		useDispatch: store => dispatchers[ store ]
	}), { virtual: true } );

	jest.doMock( '../../helpers/use-settings.js', () => () => [ jest.fn(), jest.fn(), 'loaded' ]);
	jest.doMock( '../../helpers/helper-functions.js', () => ({
		setUtm: jest.fn()
	}) );

	window.themeisleGutenberg = { isBlockEditor: true };

	require( '../../plugins/welcome-guide' );

	// Same React instance as the module under test, which loaded after resetModules().
	const { act, createElement } = require( 'react' );
	const { createRoot } = require( 'react-dom/client' );
	const root = createRoot( document.createElement( 'div' ) );

	act( () => {
		root.render( createElement( Render ) );
	});

	return { onFinish: guideProps.onFinish, setPreference };
};

describe( 'Welcome guide dismissal', () => {
	beforeAll( () => {
		global.IS_REACT_ACT_ENVIRONMENT = true;
	});

	afterAll( () => {
		delete global.IS_REACT_ACT_ENVIRONMENT;
	});

	afterEach( () => {
		window.localStorage.clear();
		delete window.themeisleGutenberg;
	});

	it( 'saves the dismissal as a user preference when the guide is closed', () => {
		const { onFinish, setPreference } = renderWelcomeGuide();

		onFinish();

		expect( setPreference ).toHaveBeenCalledWith( 'themeisle/otter-blocks', 'show-welcome-guide', false );
		expect( window.localStorage.getItem( 'o-show-onboarding' ) ).toBe( 'false' );
	});
});
