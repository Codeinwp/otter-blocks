type TrackingData = {
    block?: string;
    env?: string;
    action?: 'block-created' | 'block-updated' | 'block-deleted';
    feature?: string;
    groupID?: string;
    featureComponent?: string;
    featureValue?: string;
    hasOpenAIKey?: boolean;
    usedTheme?: string;
};

type EventResponse = {
    error?: string;
    success?: boolean;
    response?: any;
};

type EventOptions = {
    directSave?: boolean;
    consent?: boolean;
    refreshTimer?: boolean;
    sendNow?: boolean;
    ignoreLimit?: boolean;
};

interface EventTrackingAccumulatorWithPlugin {
	add: ( data: TrackingData, options?: EventOptions ) => string;
	set: ( key: string, data: TrackingData, options?: EventOptions ) => void;
	base: EventTrackingAccumulator;
}

interface EventTrackingAccumulator {
	subscribe( callback: ( response: EventResponse ) => void ): () => void;
	hasConsent(): boolean;
	sendBulkTracking( payload: Array<TrackingData> ): Promise<Response>;
	trkMetadata( data: TrackingData ): TrackingData;
	with( pluginSlug: string ): EventTrackingAccumulatorWithPlugin;
	uploadEvents(): Promise<void>;
	sendIfLimitReached(): Promise<void> | undefined;
	start(): void;
	stop(): void;
	refreshTimer(): void;
	clone(): EventTrackingAccumulator;
}

declare global {
	interface Window {
		themeisleGutenberg?: {
			hasNeve: boolean
			version: string
			hasPro: boolean
			upgradeLink: string
			patternsLink: string
			should_show_upsell: boolean
			assetsPath: string
			updatePath: string
			optionsPath: object
			mapsAPI: object
			globalDefaults: {
				[key: `themeisle-blocks/${string}`]: object
			}
			themeDefaults: object
			imageSizes: string[]
			isWPVIP: boolean
			canTrack: boolean
			userRoles: {
				[key: string]: {
					name: string
					capabilities: object
				}
			}
			isBlockEditor: boolean
			isLegacyPre59: boolean
			postTypes: {
				page: string
				post: string
				[key: string]: string
			}
			rootUrl: string
			hasModule: {
				blockCSS: boolean
				blockAnimations: boolean
				blockConditions: boolean
				aiToolbar: boolean
			}
			blocksIDs: string[]
			isAncestorTypeAvailable: boolean
			highlightDynamicText: boolean
			isPreview: boolean
			hasOpenAiKey: boolean
		}
		otterPro?: Readonly<{
			isActive: boolean
			isExpired: boolean
			licenseType: string
			hasNeveLicense: boolean
			hasWooCommerce: boolean
			hasLearnDash: boolean
			rootUrl: string
		}>
		otterObj?: Readonly<Partial<{
			assetsPath: string
			docksLink: string
			hasNevePro: string
			hasPro: string
			license:{
				expiration: boolean
				key: string
				valid: string
			}
			purcharseHistoryURL: string
			showFeedbackNotice: boolean
			storeURL: string
			styleExist: string
			upgradeLink: string
			upgradeLinkFromTc: string
			tcUpgradeLink: string
			tcDocs: string
			version: string
		}>>
		themeisleGutenbergCountdown: {
			i18n: {
				second: string
				seconds: string
				minute: string
				minutes: string
				hour: string
				hours: string
				day: string
				days: string
			}
			timezone: string
		},
		oThemeStyles?: {
			colors?: {label: string, value: string}[],
			gradients?: {label: string, value: string}[],
			cssVars?: string[]
		},
		otterComponents?: {
			SelectProducts?: ( props: any ) => JSX.Element
			Notice?: ( props: { notice: any, variant: string, instructions: 'string'}) => JSX.Element
			useInspectorSlot?: ( name: string ) => any
		},
		liveSearchData: {
			nonce: string,
			restUrl: string,
			permalinkStructure: string,
			strings: {
				noResults: string
				noTitle: string
			}
		},
		oSavedStates?: {
			[key: string]: any
		},
		oTrk?: EventTrackingAccumulatorWithPlugin
		tiTrk?: EventTrackingAccumulator
	}
}

export default global;
