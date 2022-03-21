/**
 * The emails lists from the provider.
 * @param {string} provider
 * @param {string} apiKey
 * @param {string} action
 * @param {Function} onSuccess
 * @param {Function} onError
 * @param {RequestInit} fetchOptions
 */
export const getListIdOptionFrom = ( provider, apiKey, action, onSuccess, onError, fetchOptions = {}) => {
	window.wp.apiFetch({ path: 'otter/v1/integration', method: 'POST', data: { provider, apiKey, action }, ...fetchOptions}).then(
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

