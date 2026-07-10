import BaseComponent from "./BaseComponent.js";

export default class Service extends BaseComponent {

    constructor(app, options = {}) {

        super(app);

        this.options = options;

        this._busListeners = [];

        if (!this.shouldInitialize()) return;

        this.bindBusEvents();

        this.initialize?.();
    }

    busEvents() {

        return {};

    }

    bindBusEvents() {

        for (const [event, handler] of Object.entries(this.busEvents())) {

            if (typeof handler !== "function") continue;

            const listener = handler.bind(this);

            this.eventBus.on(event, listener);

            this._busListeners.push({event, listener});

        }

    }

    emit(event, payload = {}) {

        this.eventBus.emit(event, payload);

    }

    shouldInitialize() {

        return true;

    }

    destroy() {

        super.destroy();

        for (const item of this._busListeners) {

            this.eventBus.off(item.event, item.listener);

        }

        this._busListeners.length = 0;

    }

}
