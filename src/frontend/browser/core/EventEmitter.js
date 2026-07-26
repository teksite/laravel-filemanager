export default class EventEmitter {
    constructor() {
        this.events = Object.create(null);
    }

    /**
     * Subscribe to event
     */
    on(event, callback) {
        if (typeof callback !== 'function') return this;

        if (!this.events[event]) {
            this.events[event] = new Set();
        }

        this.events[event].add(callback);

        return this;
    }

    /**
     * Subscribe once
     */
    once(event, callback) {

        if (typeof callback !== 'function') return this;

        const wrapper = (...args) => {

            this.off(event, wrapper);
            callback(...args);
        };

        this.on(event, wrapper);

        return this;
    }

    /**
     * Unsubscribe
     */
    off(event, callback) {

        if (!this.events[event]) return this;

        if (!callback) {
            delete this.events[event];
            return this;
        }

        this.events[event].delete(callback);

        if (this.events[event].size === 0) {
            delete this.events[event];
        }

        return this;
    }

    /**
     * Emit event
     */
    emit(event, ...args) {
        const listeners = this.events[event];

        if (!listeners || listeners.size === 0) return false;

        for (const listener of listeners) {

            try {
                listener(...args);
            } catch (error) {
                console.error(`[EventEmitter Error] ${event}`, error);
            }
        }

        return true;
    }

    /**
     * Remove all events
     */
    clear() {
        this.events = Object.create(null);
    }

    /**
     * Get listeners count
     */
    count(event) {
        return this.events[event]?.size || 0;
    }

    /**
     * Debug helper
     */
    list() {
        return Object.keys(this.events);
    }
}
