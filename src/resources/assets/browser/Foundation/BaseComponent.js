import {$, $$} from "../helpers/dom.js";

export default class BaseComponent {

    constructor(app) {

        this.app = app;

        this.config = app.config;

        this.state = app.state;

        this.request = app.request;

        this.eventBus = app.eventBus;

        this.errorBus = app.errorBus;

        this.root = app.root ?? document;

        this.$ = (selector, root = this.root) => $(selector, root);

        this.$$ = (selector, root = this.root) => $$(selector, root);

        this.controller = null;

        this.destroyed = false;
    }

    createAbortController() {

        this.abort();

        this.controller = new AbortController();

        return this.controller;
    }

    abort() {

        this.controller?.abort();

        this.controller = null;
    }

    nextFrame(callback) {

        requestAnimationFrame(callback);
    }

    destroy() {

        this.abort();

        this.destroyed = true;
    }

}
