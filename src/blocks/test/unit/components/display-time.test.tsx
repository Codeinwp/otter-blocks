import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DisplayTime from '../../../blocks/countdown/components/display-time';

describe( '[Countdown] Display Time', () => {

	test( 'should render', () => {
		const { container } = render( <DisplayTime time={0}/> );

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
		const { container } = render( <DisplayTime time={0}/> );

		expect( container.querySelector( `div[name="${tag}"]` ) ).toBeDefined();
		expect( container.querySelector( `div[name="${tag}"] .otter-countdown__value` )?.innerHTML ).toBe( value );
		expect( container.querySelector( `div[name="${tag}"] .otter-countdown__label` )?.innerHTML ).toMatch( label );
	});

});
