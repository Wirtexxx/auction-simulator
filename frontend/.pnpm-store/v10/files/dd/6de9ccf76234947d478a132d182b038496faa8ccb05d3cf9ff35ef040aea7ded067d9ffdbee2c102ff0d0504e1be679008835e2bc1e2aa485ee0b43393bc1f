import { ImpactHapticFeedbackStyle, NotificationHapticFeedbackType, PostEventError } from '@tma.js/bridge';
import { Computed } from '@tma.js/signals';
import { either as E } from 'fp-ts';
import { SharedFeatureOptions } from '../../fn-options/sharedFeatureOptions.js';
import { WithPostEvent } from '../../fn-options/withPostEvent.js';
import { WithVersion } from '../../fn-options/withVersion.js';
import { WithChecksFp, WithChecks } from '../../with-checks/withChecksFp.js';
type HapticFeedbackEither = E.Either<PostEventError, void>;
export interface HapticFeedbackOptions extends WithVersion, WithPostEvent, SharedFeatureOptions {
}
/**
 * @since Mini Apps v6.1
 */
export declare class HapticFeedback {
    constructor({ postEvent, isTma, version }: HapticFeedbackOptions);
    /**
     * Signal indicating if the component is supported.
     */
    readonly isSupported: Computed<boolean>;
    /**
     * A method that tells if an impact occurred. The Telegram app may play the
     * appropriate haptics based on style value passed.
     * @param style - impact style.
     * @since Mini Apps v6.1
     */
    impactOccurredFp: WithChecksFp<(style: ImpactHapticFeedbackStyle) => HapticFeedbackEither, true>;
    /**
     * @see impactOccurredFp
     */
    impactOccurred: WithChecks<(style: ImpactHapticFeedbackStyle) => void, true>;
    /**
     * A method tells that a task or action has succeeded, failed, or produced
     * a warning. The Telegram app may play the appropriate haptics based on type
     * value passed.
     * @param type - notification type.
     * @since Mini Apps v6.1
     */
    notificationOccurredFp: WithChecksFp<(type: NotificationHapticFeedbackType) => HapticFeedbackEither, true>;
    /**
     * @see notificationOccurredFp
     */
    notificationOccurred: WithChecks<(type: NotificationHapticFeedbackType) => void, true>;
    /**
     * A method tells that the user has changed a selection. The Telegram app may
     * play the appropriate haptics.
     *
     * Do not use this feedback when the user makes or confirms a selection; use
     * it only when the selection changes.
     * @since Mini Apps v6.1
     */
    selectionChangedFp: WithChecksFp<() => HapticFeedbackEither, true>;
    /**
     * @see selectionChangedFp
     */
    selectionChanged: WithChecks<() => void, true>;
}
export {};
