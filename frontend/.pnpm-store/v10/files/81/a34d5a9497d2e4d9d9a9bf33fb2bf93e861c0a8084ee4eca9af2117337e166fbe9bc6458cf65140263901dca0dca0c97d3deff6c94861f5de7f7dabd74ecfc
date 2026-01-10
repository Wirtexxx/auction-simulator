import { PostEventError } from '@tma.js/bridge';
import { Computed } from '@tma.js/signals';
import { either as E } from 'fp-ts';
import { SharedFeatureOptions } from '../../fn-options/sharedFeatureOptions.js';
import { WithPostEvent } from '../../fn-options/withPostEvent.js';
import { WithStateRestore } from '../../fn-options/withStateRestore.js';
import { WithVersion } from '../../fn-options/withVersion.js';
import { WithChecks, WithChecksFp } from '../../with-checks/withChecksFp.js';
export interface SwipeBehaviorState {
    isVerticalEnabled: boolean;
}
export interface SwipeBehaviorOptions extends WithStateRestore<SwipeBehaviorState>, WithVersion, WithPostEvent, SharedFeatureOptions {
}
/**
 * @since Mini Apps v7.7
 */
export declare class SwipeBehavior {
    constructor({ postEvent, storage, isTma, isPageReload, version }: SwipeBehaviorOptions);
    /**
     * Signal indicating if the component is supported.
     */
    readonly isSupported: Computed<boolean>;
    /**
     * Signal indicating if vertical swipes are enabled.
     */
    readonly isVerticalEnabled: Computed<boolean>;
    /**
     * Signal indicating if the component is currently mounted.
     */
    readonly isMounted: Computed<boolean>;
    /**
     * Mounts the component restoring its state.
     * @since Mini Apps v7.7
     */
    readonly mountFp: WithChecksFp<() => void, true>;
    /**
     * @see mountFp
     */
    readonly mount: WithChecks<() => void, true>;
    /**
     * Unmounts the component.
     */
    readonly unmount: () => void;
    /**
     * Disables the closing confirmation dialog.
     * @since Mini Apps v7.7
     */
    readonly disableVerticalFp: WithChecksFp<() => E.Either<PostEventError, void>, true>;
    /**
     * @see disableVerticalFp
     */
    readonly disableVertical: WithChecks<() => void, true>;
    /**
     * Enables the closing confirmation dialog.
     * @since Mini Apps v7.7
     */
    readonly enableVerticalFp: WithChecksFp<() => E.Either<PostEventError, void>, true>;
    /**
     * @see enableVerticalFp
     */
    readonly enableVertical: WithChecks<() => void, true>;
}
