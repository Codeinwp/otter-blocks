export const getListIdOptionFrom = ( provider, apiKey, onSuccess, onError ) => {
	window.wp.apiFetch({ path: 'otter/v1/integration', method: 'POST', data: { provider, apiKey }}).then(
		res => {
			if ( res?.success ) {
				const result = res?.list_id?.map( item => {
					return {
						label: item.name,
						value: item.id?.toString()
					};
				}) || [];
				onSuccess( result );
			} else {
				onError( res );
			}
		}
	).catch( err => {
		console.log( err );
	});
};
