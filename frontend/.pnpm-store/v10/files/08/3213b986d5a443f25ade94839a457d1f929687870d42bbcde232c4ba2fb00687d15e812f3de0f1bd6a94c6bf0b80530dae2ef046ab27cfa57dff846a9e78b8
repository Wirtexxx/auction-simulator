import { Computed } from '@tma.js/signals';
import { InitData as InitDataType } from '@tma.js/types';
import { either as E, option as O } from 'fp-ts';
export interface InitDataOptions<Err> {
    /**
     * Retrieves init data from the current environment.
     */
    retrieveInitData: () => E.Either<Err, O.Option<{
        raw: string;
        obj: InitDataType;
    }>>;
}
export declare class InitData<Err extends Error> {
    constructor({ retrieveInitData }: InitDataOptions<Err>);
    private fromState;
    private readonly _state;
    private readonly _raw;
    /**
     * Complete component state.
     */
    readonly state: Computed<InitDataType | undefined>;
    /**
     * @see InitDataType.auth_date
     */
    readonly authDate: Computed<Date | undefined>;
    /**
     * @see InitDataType.can_send_after
     */
    readonly canSendAfter: Computed<number | undefined>;
    /**
     * Date after which it is allowed to call
     * the [answerWebAppQuery](https://core.telegram.org/bots/api#answerwebappquery) method.
     */
    readonly canSendAfterDate: Computed<Date | undefined>;
    /**
     * @see InitDataType.chat
     */
    readonly chat: Computed<import('@tma.js/types').Chat | undefined>;
    /**
     * @see InitDataType.chat_type
     */
    readonly chatType: Computed<string | undefined>;
    /**
     * @see InitDataType.chat_instance
     */
    readonly chatInstance: Computed<string | undefined>;
    /**
     * @see InitDataType.hash
     */
    readonly hash: Computed<string | undefined>;
    /**
     * @see InitDataType.query_id
     */
    readonly queryId: Computed<string | undefined>;
    /**
     * Raw representation of init data.
     */
    readonly raw: Computed<string | undefined>;
    /**
     * @see InitDataType.receiver
     */
    readonly receiver: Computed<import('@tma.js/types').User | undefined>;
    /**
     * @see InitDataType.signature
     */
    readonly signature: Computed<string | undefined>;
    /**
     * @see InitDataType.start_param
     */
    readonly startParam: Computed<string | undefined>;
    /**
     * @see InitDataType.user
     */
    readonly user: Computed<import('@tma.js/types').User | undefined>;
    /**
     * Restores the component state.
     */
    readonly restoreFp: () => E.Either<Err, void>;
    /**
     * @see restoreFp
     */
    readonly restore: () => void;
}
