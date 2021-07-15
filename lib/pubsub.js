const EMPTY_SUBSCRIPTION = {
    unsubscribe: () => undefined,
};
export class PubSub {
    constructor() {
        this.consumers = new Map();
    }
    /** A number of subscribed consumers. */
    get size() {
        return this.consumers.size;
    }
    /** Subscribes a consumer of values. */
    subscribe(consumer) {
        if (!consumer) {
            return EMPTY_SUBSCRIPTION;
        }
        const consumerKey = Object.create(null);
        this.consumers.set(consumerKey, consumer);
        return new Subscription(this.consumers, consumerKey);
    }
    /** Emits a value to subscribed consumers. */
    emit(value) {
        if (this.consumers.size === 0) {
            return;
        }
        this.consumers.forEach(consumer => consumer(value));
    }
    /** Removes all subscribed consumers. */
    clear() {
        this.consumers.clear();
        this.consumers = new Map();
    }
}
class Subscription {
    constructor(consumers, consumerKey) {
        this.consumers = consumers;
        this.consumerKey = consumerKey;
    }
    unsubscribe() {
        if (this.consumers && this.consumerKey) {
            this.consumers.delete(this.consumerKey);
        }
        this.consumers = undefined;
        this.consumerKey = undefined;
    }
}
//# sourceMappingURL=pubsub.js.map