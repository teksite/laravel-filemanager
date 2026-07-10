import BaseComponent from "./BaseComponent.js";

export default class UiService extends BaseComponent {

    constructor(app) {

        super(app);

        this._busListeners = [];

        this._domListeners = [];

        this.loadElements();

        if (!this.shouldInitialize()) return;


        this.bindBusEvents();

        this.bindDomEvents();

        this.initialize?.();

    }

    /*
    |--------------------------------------------------------------------------
    | Elements
    |--------------------------------------------------------------------------
    */

    loadElements() {

        const elements = this.defineElements?.() ?? {};

        for (const [name, selector] of Object.entries(elements)) {

            this[name] = typeof selector === 'function'
                ? selector.call(this)
                : this.$(selector);

        }

    }

    defineElements() {

        return {};

    }

    /*
    |--------------------------------------------------------------------------
    | EventBus
    |--------------------------------------------------------------------------
    */

    bindBusEvents() {

        const events = this.busEvents?.() ?? {};

        for (const [event, handler] of Object.entries(events)) {

            if (typeof handler !== 'function') continue;

            const listener = handler.bind(this);

            this.eventBus.on(event, listener);

            this._busListeners.push({event, listener});

        }

    }

    busEvents() {

        return {};

    }

    /*
    |--------------------------------------------------------------------------
    | DOM Events
    |--------------------------------------------------------------------------
    */

    bindDomEvents() {

        const events = this.domEvents?.() ?? [];

        for (const [element, event, handler] of events) {

            if (!element || typeof handler !== 'function') {
                continue;
            }

            const listener = handler.bind(this);

            element.addEventListener(event, listener);

            this._domListeners.push({element, event, listener});

        }

    }

    domEvents() {

        return [];

    }

    /*
    |--------------------------------------------------------------------------
    | LifeCycle
    |--------------------------------------------------------------------------
    */

    shouldInitialize() {

        return true;

    }

    destroy() {

        for (const {event, listener} of this._busListeners) {

            this.eventBus.off(event, listener);

        }

        for (const {element, event, listener} of this._domListeners) {

            element.removeEventListener(event, listener);

        }

        this._busListeners.length = 0;

        this._domListeners.length = 0;

    }

}
