/**
 * ESLint flat config for ESLint v10.
 *
 * Start from the @wordpress/scripts defaults, then restore Otter's previous
 * style rules and rule severities from the legacy .eslintrc config.
 */
const wpScriptsConfig = require( '@wordpress/scripts/config/eslint.config.cjs' );

const plugins = wpScriptsConfig.reduce(
	( allPlugins, config ) => ( {
		...allPlugins,
		...( config.plugins || {} ),
	} ),
	{}
);

module.exports = [
	...wpScriptsConfig,
	{
		ignores: [ '**/node_modules/**', '**/assets/**' ],
	},
	{
		files: [ '**/*.{js,jsx,ts,tsx}' ],
		plugins,
		languageOptions: {
			ecmaVersion: 2021,
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		settings: {
			'import/resolver': {
				node: {
					extensions: [ '.js', '.jsx', '.ts', '.tsx', '.json' ],
				},
			},
		},
		rules: {
			indent: [ 'error', 'tab' ],
			'linebreak-style': [ 'error', 'unix' ],
			quotes: [ 'error', 'single' ],
			semi: [ 'error', 'always' ],
			'prefer-destructuring': [
				'warn',
				{
					array: false,
					object: true,
				},
				{
					enforceForRenamedProperties: false,
				},
			],
			'array-bracket-spacing': [
				'warn',
				'always',
				{
					arraysInArrays: false,
					objectsInArrays: false,
				},
			],
			'key-spacing': [
				'warn',
				{
					beforeColon: false,
					afterColon: true,
				},
			],
			'object-curly-spacing': [
				'warn',
				'always',
				{
					arraysInObjects: true,
					objectsInObjects: false,
				},
			],
			'prettier/prettier': 'off',
			'react-hooks/rules-of-hooks': 'warn',
			'dot-notation': 'off',
			'@wordpress/no-unsafe-wp-apis': 'warn',
			'no-undef': 'warn',
			'no-shadow': 'warn',
			'@typescript-eslint/no-shadow': 'warn',
			'@wordpress/no-base-control-with-label-without-id': 'warn',
			'no-unused-vars': 'warn',
			'@typescript-eslint/no-unused-vars': 'warn',
			'jsdoc/require-returns-description': 'warn',
			'no-unused-expressions': 'warn',
			'jsdoc/require-returns-type': 'warn',
			'no-nested-ternary': 'warn',
			'no-console': 'warn',
			'jsdoc/require-param-type': 'warn',
			'jsdoc/no-undefined-types': 'warn',
			'jsx-a11y/click-events-have-key-events': 'warn',
			'jsx-a11y/no-static-element-interactions': 'warn',
			'import/no-extraneous-dependencies': 'off',
			'jsx-a11y/label-has-associated-control': 'warn',
			'jsx-a11y/alt-text': 'warn',
			'jsx-a11y/anchor-is-valid': 'warn',
			'jsx-a11y/no-noninteractive-element-interactions': 'warn',
			'jsx-a11y/no-autofocus': 'warn',
			'@wordpress/i18n-text-domain': [
				'error',
				{
					allowedTextDomain: [
						'otter-blocks',
						'otter-pro',
						'blocks-export-import',
						'blocks-css',
						'blocks-animation',
					],
				},
			],

			// Keep the v10 migration scoped to the previous lint contract.
			'import/no-unresolved': 'off',
			'import/no-duplicates': 'off',
			'import/named': 'off',
			'import/default': 'off',
			'@typescript-eslint/method-signature-style': 'off',
			'jest/valid-title': 'off',
		},
	},
	{
		files: [ '**/*.{test,spec}.{js,jsx,ts,tsx}', '**/test/**/*.{js,jsx,ts,tsx}' ],
		languageOptions: {
			globals: {
				describe: 'readonly',
				it: 'readonly',
				test: 'readonly',
				expect: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
				beforeAll: 'readonly',
				afterAll: 'readonly',
				jest: 'readonly',
			},
		},
	},
];
