export const findBlock = ( blocksAr, name ) => {
	const foundBlock = blocksAr.find( block => block.name === name );

	if ( foundBlock ) {
		return foundBlock;
	}

	return blocksAr.reduce( ( found, block ) => {
		if ( found ) {
			return found;
		}

		if ( block.innerBlocks && Array.isArray( block.innerBlocks ) ) {
			return findBlock( block.innerBlocks, name );
		}

		return undefined;
	}, undefined );
};
