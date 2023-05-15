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
			}
			blocksIDs: string[]
			isAncestorTypeAvailable: boolean
			highlightDynamicText: boolean
			isPreview: boolean
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
		}
	}
}

export default global;
