import { Disabled } from '@wordpress/components';
import { ReactNode } from 'react';

type AutoDisableSyncAttrProps<T> = {
    attr: string,
    attributes: T,
    children: ReactNode
}

/**
 * A wrapper that disable the children when the given attributes name is on the list with the synced attrs.
 * @param props The props
 * @returns A wrapper that disable the component when the given attributes name is in sync.
 */
function AutoDisableSyncAttr<T extends { isSynced?: string[] }>( props: AutoDisableSyncAttrProps<T> ) {

	/**
     * Info: At first this was used aS inline component in Form,
     * but caused a lot of issues in which React kept loosing the reference of it and caused some unwanted behavior.
     * Making it external solved the issue.
     */
	return <Disabled
		isDisabled={
			Boolean( props?.attributes?.isSynced?.includes( props?.attr ) )
		}
		className="o-disabled"
	>
		{ props?.children }
	</Disabled>;
};

export default AutoDisableSyncAttr;
