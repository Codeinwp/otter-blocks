import { getAttributesFromHTML } from '../../plugins/html-edit/attributes';

const blockType = ( name, attributes = {}) => ({ name: `themeisle-blocks/${ name }`, attributes });

const progressBar = blockType( 'progress-bar', { title: { type: 'string' }, percentage: { type: 'number' }});
const circleCounter = blockType( 'circle-counter', { title: { type: 'string' }, percentage: { type: 'number' }});
const formInput = blockType( 'form-input', { label: { type: 'string' }, placeholder: { type: 'string' }, helpText: { type: 'string' }});

const countdownHTML = ( date ) => `<div id="c1" data-date="${ date }" class="wp-block-themeisle-blocks-countdown"><div class="otter-countdown__container"></div></div>`;

const progressHTML = ({ title = 'Skill', percent = 50, number = '50%' } = {}) => `<div id="p1" class="wp-block-themeisle-blocks-progress-bar" data-percent="${ percent }" data-duration="2"><div class="wp-block-themeisle-blocks-progress-bar__area"><div class="wp-block-themeisle-blocks-progress-bar__area__title"><span>${ title }</span></div><div class="wp-block-themeisle-blocks-progress-bar__area__bar"></div><div class="wp-block-themeisle-blocks-progress-bar__progress wp-block-themeisle-blocks-progress-bar__number">${ number }</div></div></div>`;

const circleHTML = ( title, percentage ) => `<div id="cc1" class="wp-block-themeisle-blocks-circle-counter" data-percentage="${ percentage }"><div class="wp-block-themeisle-blocks-circle-counter-title__area"><span class="wp-block-themeisle-blocks-circle-counter-title__value">${ title }</span></div><div class="wp-block-themeisle-blocks-circle-counter__bar"></div></div>`;

const iconListItemHTML = ( content ) => `<div id="i1" class="wp-block-themeisle-blocks-icon-list-item"><i class="fas fa-star wp-block-themeisle-blocks-icon-list-item-icon"></i><p class="wp-block-themeisle-blocks-icon-list-item-content">${ content }</p></div>`;

const formInputHTML = ({ label, placeholder, help }) => `<div id="f1" class="wp-block-themeisle-blocks-form-input"><label for="f1-input" class="otter-form-input-label"><span class="otter-form-input-label__label">${ label }</span><span class="required">*</span></label><input type="text" id="f1-input" required placeholder="${ placeholder }" class="otter-form-input"/>${ help ? `<span class="o-form-help">${ help }</span>` : '' }</div>`;

describe( 'getAttributesFromHTML', () => {
	it( 'keeps the attributes object when the markup matches them', () => {
		const cases = [
			[{ date: '2026-10-01T10:00:00' }, blockType( 'countdown', { date: { type: 'string' }}), countdownHTML( '2026-10-01T10:00:00' ) ],
			[{ title: 'Skill', percentage: 50 }, progressBar, progressHTML() ],
			[{ title: 'A & B', percentage: 50 }, progressBar, progressHTML({ title: 'A &amp; B' }) ],
			[{ title: 'Skill', percentage: 50 }, circleCounter, circleHTML( 'Skill', 50 ) ],
			[{ content: 'Say &quot;hi&quot; <strong>now</strong>' }, blockType( 'icon-list-item' ), iconListItemHTML( 'Say &quot;hi&quot; <strong>now</strong>' ) ],
			[{ label: 'Name', placeholder: 'Jane', helpText: 'Help' }, formInput, formInputHTML({ label: 'Name', placeholder: 'Jane', help: 'Help' }) ]
		];

		cases.forEach( ([ attributes, type, html ]) => {
			expect( getAttributesFromHTML( attributes, type, html ) ).toBe( attributes );
		});
	});

	it( 'reads an edited Countdown date', () => {
		const attributes = { id: 'c1', date: '2026-10-01T10:00:00' };

		expect( getAttributesFromHTML( attributes, blockType( 'countdown', { date: { type: 'string' }}), countdownHTML( '2026-12-25T10:00:00' ) ) )
			.toEqual({ id: 'c1', date: '2026-12-25T10:00:00' });
	});

	it( 'reads an edited Progress Bar title as plain text', () => {
		expect( getAttributesFromHTML({ title: 'Skill', percentage: 50 }, progressBar, progressHTML({ title: 'Design &amp; UX' }) ) )
			.toEqual({ title: 'Design & UX', percentage: 50 });
	});

	it( 'reads an edited percentage as a number from any place it is rendered', () => {
		expect( getAttributesFromHTML({ title: 'Skill', percentage: 50 }, progressBar, progressHTML({ percent: 80, number: '80%' }) ).percentage ).toBe( 80 );
		expect( getAttributesFromHTML({ title: 'Skill', percentage: 50 }, progressBar, progressHTML({ number: '65%' }) ).percentage ).toBe( 65 );
		expect( getAttributesFromHTML({ title: 'Skill', percentage: 50 }, circleCounter, circleHTML( 'Skill', 70 ) ).percentage ).toBe( 70 );
	});

	it( 'ignores a percentage that is not a number', () => {
		const attributes = { title: 'Skill', percentage: 50 };

		expect( getAttributesFromHTML( attributes, progressBar, progressHTML({ percent: 'abc', number: '%' }) ) ).toBe( attributes );
	});

	it( 'reads edited rich text as markup', () => {
		expect( getAttributesFromHTML({ content: 'Entry' }, blockType( 'icon-list-item' ), iconListItemHTML( 'Entry <strong>two</strong>' ) ) )
			.toEqual({ content: 'Entry <strong>two</strong>' });
	});

	it( 'reads edited Form field texts and keeps the ones missing from the markup', () => {
		expect( getAttributesFromHTML(
			{ label: 'Name', placeholder: 'Jane', helpText: 'Help' },
			formInput,
			formInputHTML({ label: 'Full name', placeholder: 'John' })
		) ).toEqual({ label: 'Full name', placeholder: 'John', helpText: 'Help' });
	});

	it( 'leaves other blocks alone', () => {
		const attributes = { content: 'Heading' };

		expect( getAttributesFromHTML( attributes, blockType( 'advanced-heading' ), '<h2>Other</h2>' ) ).toBe( attributes );
		expect( getAttributesFromHTML( attributes, blockType( 'icon-list-item' ), '' ) ).toBe( attributes );
	});
});
