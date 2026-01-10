import { PostEventError } from '@tma.js/bridge';
import { Computed } from '@tma.js/signals';
import { either as E } from 'fp-ts';
import { SharedFeatureOptions } from '../../fn-options/sharedFeatureOptions.js';
import { WithPostEvent } from '../../fn-options/withPostEvent.js';
import { WithStateRestore } from '../../fn-options/withStateRestore.js';
import { WithChecks, WithChecksFp } from '../../with-checks/withChecksFp.js';
export interface ClosingBehaviorState {
    isConfirmationEnabled: boolean;
}
export interface ClosingBehaviorOptions extends WithStateRestore<ClosingBehaviorState>, WithPostEvent, SharedFeatureOptions {
}
export declare class ClosingBehavior {
    constructor({ postEvent, storage, isTma, isPageReload }: ClosingBehaviorOptions);
    /**
     * Signal indicating if closing confirmation dialog is currently enabled.
     */
    readonly isConfirmationEnabled: Computed<boolean>;
    /**
     * Signal indicating if the component is currently mounted.
     */
    readonly isMounted: Computed<boolean>;
    /**
     * Mounts the component restoring its state.
     */
    readonly mountFp: WithChecksFp<() => void, false>;
    /**
     * @see mountFp
     */
    readonly mount: WithChecks<() => void, false>;
    /**
     * Unmounts the component.
     */
    readonly unmount: () => void;
    /**
     * Disables the closing confirmation dialog.
     */
    readonly disableConfirmationFp: WithChecksFp<() => E.Either<PostEventError, void>, false>;
    /**
     * @see disableConfirmationFp
     */
    readonly disableConfirmation: WithChecks<() => void, false>;
    /**
     * Enables the closing confirmation dialog.
     */
    readonly enableConfirmationFp: WithChecksFp<() => E.Either<PostEventError, void>, false>;
    /**
     * @see enableConfirmationFp
     */
    readonly enableConfirmation: WithChecks<() => void, false>;
}
