
/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
* Internal dependencies
*/
import ProgressBarEdit from '../../../src/blocks/blocks/progress-bar/save.js';

describe( 'Progress Bar', () => {

	let props;

	beforeEach( () => {
		props = {
			clientId: '025f09a0-499f-4b15-a45d-a4ea62a08481',
			name: 'themeisle-blocks/progress-bar',
			attributes: {
				id: 'wp-block-themeisle-blocks-progress-bar-6949cf5d',
				title: 'title',
				percentage: 30
			},
			setAttributes: ( attrs ) => {
				props.attributes = { ...props.attributes, ...attrs };
			},
			isSelected: true,
			toggleSelection: ( value ) => {
				props.isSelected = value;
			}
		};
	});

	it( 'should render with empty attributes', () => {
		const edit = shallow( <ProgressBarEdit { ...props } attributes={{}} /> );

		expect( edit.hasClass( 'wp-block-themeisle-blocks-progress-bar' ) ).toBe( true );
	});
});
