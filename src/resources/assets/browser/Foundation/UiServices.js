import {ServiceProvider} from "./ServiceProvider.js";
import {$, $$} from "../helpers/dom.js";


class UiServices extends ServiceProvider {
    constructor() {

        super();

        this.$ = $;
        
        this.$$ = $$;

        this._busListeners=[];

        this._domListeners=[];

        this._stateListeners=[];


        this.loadElements();

        if(!this.shouldInitialize()) return;


        this.bindBusEvents();

        this.bindUiEvents();
    }

    loadElements() {

        const map = this.defineElements?.() ?? {};

        Object.entries(map).forEach(([key, selector]) => {

            this[key] = this.$(selector);

        });

    }


    bindBusEvents() {

        const events = this.busEvents?.() ?? {};

        for (const [event, handler] of Object.entries(events)) {

            const listener = (payload) => handler.call(this, payload);

            this.eventBus.on(event, listener);

            this._busListeners.push({event, listener});

        }
    }


    bindUiEvents() {

        const events = this.domEvents?.() ?? [];

        for (const [element, event, handler] of events) {

            if (!element) continue;

            const listener = handler.bind(this);

            element.addEventListener(event, listener);

            this._domListeners.push({element, event, listener});

        }

    }


    shouldInitialize() {
        return true;
    }

    defineElements() {
        return {};
    }

    busEvents() {
        return {};
    }

    domEvents() {
        return {};
    }


    destroy() {

        for (const item of this._busListeners) {

            this.eventBus.off(item.event, item.listener);

        }

        for (const item of this._domListeners) {

            item.element.removeEventListener(
                item.event,
                item.listener
            );
        }

    }

}
