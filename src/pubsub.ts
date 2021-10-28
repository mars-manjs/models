/** Allows to cancel a subscription. It is compatible with RxJS/Subscription. */
export interface Subscription_i {
    unsubscribe(): void;
}

export type Consumer<T> = (value: T) => any;

export interface Publisher<T> {
    subscribe(consumer: Consumer<T>): Subscription_i;
}

const EMPTY_SUBSCRIPTION: Subscription_i = {
    unsubscribe: () => undefined,
};

export class PubSub<T> implements Publisher<T> {
    private consumers: Map<object, Consumer<T>>;

    constructor() {
        this.consumers = new Map<object, Consumer<T>>();
    }

    /** A number of subscribed consumers. */
    get size(): number {
        return this.consumers.size;
    }

    /** Subscribes a consumer of values. */
    subscribe(consumer: Consumer<T>): Subscription_i {
        if (!consumer) {
            return EMPTY_SUBSCRIPTION;
        }
        const consumerKey = Object.create(null);
        this.consumers.set(consumerKey, consumer);
        return new Subscription(this.consumers, consumerKey);
    }

    /** Emits a value to subscribed consumers. */
    emit(value: T) {
        // console.log(this.consumers.size)
        if (this.consumers.size === 0) {
            return;
        }
        this.consumers.forEach(consumer => consumer(value));
    }

    /** Removes all subscribed consumers. */
    clear() {
        this.consumers.clear();
        this.consumers = new Map<object, Consumer<T>>();
    }
}

class Subscription<T> implements Subscription_i {
    private consumers: Map<object, Consumer<T>> | undefined;
    private consumerKey: object | undefined;

    constructor(consumers: Map<object, Consumer<T>>, consumerKey: object) {
        this.consumers = consumers;
        this.consumerKey = consumerKey;
    }

    unsubscribe(): void {
        if (this.consumers && this.consumerKey) {
            this.consumers.delete(this.consumerKey);
        }
        this.consumers = undefined;
        this.consumerKey = undefined;
    }
}
