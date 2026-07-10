import BaseComponent from "./BaseComponent.js";

export default class UiService extends BaseComponent {

    constructor(app, options = {}) {

        super(app);

        this.options = options;

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

    defineElements() {

        return {};

    }

    loadElements() {

        const map = this.defineElements();

        for (const [key, selector] of Object.entries(map)) {

            this[key] = typeof selector === "function"
                ? selector.call(this)
                : this.$(selector);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Bus
    |--------------------------------------------------------------------------
    */

    busEvents() {

        return {};

    }

    bindBusEvents() {

        for (const [event, handler] of Object.entries(this.busEvents())) {

            if (typeof handler !== "function") continue;

            const listener = handler.bind(this);

            this.eventBus.on(event, listener);

            this._busListeners.push({
                event,
                listener
            });

        }

    }

    emit(event, payload = {}) {

        this.eventBus.emit(event, payload);

    }

    /*
    |--------------------------------------------------------------------------
    | DOM
    |--------------------------------------------------------------------------
    */

    domEvents() {

        return [];

    }

    bindDomEvents() {

        for (const item of this.domEvents()) {

            const [element, event, handler, options = false] = item;

            if (!element) continue;

            if (typeof handler !== "function") continue;

            const listener = handler.bind(this);

            element.addEventListener(event, listener, options);

            this._domListeners.push({element, event, listener, options});

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    show(element) {

        element?.classList.remove("is_hide");

    }

    hide(element) {

        element?.classList.add("is_hide");

    }

    toggle(element, value) {

        element?.classList.toggle("is_hide", !value);

    }

    /*
    |--------------------------------------------------------------------------
    | Lifecycle
    |--------------------------------------------------------------------------
    */

    shouldInitialize() {

        return true;

    }

    destroy() {

        super.destroy();

        for (const item of this._busListeners) {

            this.eventBus.off(
                item.event,
                item.listener
            );

        }

        for (const item of this._domListeners) {

            item.element.removeEventListener(
                item.event,
                item.listener,
                item.options
            );

        }

        this._busListeners.length = 0;

        this._domListeners.length = 0;

    }

}
