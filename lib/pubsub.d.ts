/** Allows to cancel a subscription. It is compatible with RxJS/Subscription. */
export interface Subscription_i {
    unsubscribe(): void;
}
export declare type Consumer<T> = (value: T) => any;
export interface Publisher<T> {
    subscribe(consumer: Consumer<T>): Subscription_i;
}
export declare class PubSub<T> implements Publisher<T> {
    private consumers;
    constructor();
    /** A number of subscribed consumers. */
    get size(): number;
    /** Subscribes a consumer of values. */
    subscribe(consumer: Consumer<T>): Subscription_i;
    /** Emits a value to subscribed consumers. */
    emit(value: T): void;
    /** Removes all subscribed consumers. */
    clear(): void;
}
