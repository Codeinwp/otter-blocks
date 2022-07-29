import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DisplayTime from '../../../blocks/countdown/components/display-time.js';
import { getIntervalFromUnix } from '../../../helpers/helper-functions.js';


describe( '[Countdown] Display Time', () => {

	test( 'should render', () => {
		const time = getIntervalFromUnix( 0 );
		const { container } = render( <DisplayTime time={time}/> );

		expect( container.querySelector( '.otter-countdown__value' ) ).toBeDefined();
		expect( container.querySelector( '.otter-countdown__label' ) ).toBeDefined();
		expect( container.querySelector( '.otter-countdown__display-area' ) ).toBeDefined();
		expect( container.querySelector( '.otter-countdown__container' ) ).toBeDefined();
		expect( container.querySelector( '.otter-countdown__display' ) ).toBeDefined();
	});

	test.each([
		{ tag: 'day', label: /(Day|Days)/i, value: '0' },
		{ tag: 'hour', label: /(Hour|Hours)/i, value: '0' },
		{ tag: 'minute', label: /(Minute|Minutes)/i, value: '0' },
		{ tag: 'second', label: /(Second|Seconds)/i, value: '0' }
	])( ' should render the tag: $tag', ({ tag, label, value }) => {
		const time = getIntervalFromUnix( 0 );
		const { container } = render( <DisplayTime time={time}/> );

		expect( container.querySelector( `div[name="${tag}"]` ) ).toBeDefined();

		expect( container.querySelector( `div[name="${tag}"] .otter-countdown__value` )?.innerHTML ).toBe( value );
		expect( container.querySelector( `div[name="${tag}"] .otter-countdown__label` )?.innerHTML ).toMatch( label );
	});

});
