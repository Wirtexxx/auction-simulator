import { ComponentStorage } from '../helpers/component-storage.js';
import { MaybeAccessor } from '../types.js';
export interface WithStateRestore<T> {
    /**
     * A storage the component could use to store its data.
     */
    storage: ComponentStorage<T>;
    /**
     * True if the current page is reloaded.
     */
    isPageReload: MaybeAccessor<boolean>;
}
export declare function withStateRestore<S>(storageName: string): <O extends object>(obj: O) => O & WithStateRestore<S>;
