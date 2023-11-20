const generateFontVariables = () => {
	const { fontFamilies } = window.otterObj.defaultStyles.settings.settings.typography;

	let fontVariables = [];

	fontFamilies.forEach( ( font, index ) => {
		fontVariables.push( `--wp--preset--font-family--${ font.slug }: ${ font.fontFamily };` );
	});

	return fontVariables;
};

export const generateStylesheet = () => {
	const fontVariables = generateFontVariables();
	const style = document.createElement( 'style' );
	style.innerHTML = `.o-onboarding { ${ fontVariables.join( '' ) } }`;
	document.head.appendChild( style );
};
