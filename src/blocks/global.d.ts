declare global {
	interface Window {
		themeisleGutenberg?: {
			version: string
			isCompatible: boolean
			hasPro: boolean
			upgradeLink: string
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
				blocksConditions: boolean
			}
			blocksIDs: string[]
			isAncestorTypeAvailable: boolean
		}
		otterPro?: Readonly<{
			isActive: boolean
			isExpired: boolean
			hasWooCommerce: boolean
			hasLearnDash: boolean
			themeMods: {
				listingType: string
				altRow: boolean
				rowColor: string
				headerColor: string
				textColor: string
				borderColor: string
				altRowColor: string
				defaultFields: object
			}
			hasNeveSupport: {
				wooComparison: boolean
			}
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
			OtterControlTools?: ( props: any ) => any
		}
	}
}

export default global;
