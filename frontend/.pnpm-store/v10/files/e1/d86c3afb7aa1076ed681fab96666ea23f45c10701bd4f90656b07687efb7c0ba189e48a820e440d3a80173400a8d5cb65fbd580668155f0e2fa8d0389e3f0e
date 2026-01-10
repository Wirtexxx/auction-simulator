import { Handler } from 'mitt';
import { WildcardHandler } from '../createEmitter.js';
import { EventName, EventPayload, Events } from './index.js';
export type EventListener<E extends EventName> = Handler<EventPayload<E>>;
export type SubscribeListener = WildcardHandler<Events>;
