import {$} from "../helpers/dom.js";

export default class FooterUi {

    constructor({elements = {}} = {}, options = {}, eventBus, stateManager) {

        this.options = {...options};

        this.loadElements(elements);


        this.listeners = {};


        this.eventBus = eventBus;
        this.state = stateManager;


        this.bindBusEvents();
    }


    loadElements(elements) {

        this.counterEl = $(
            elements.counterEl ?? '[data-file-counter]'
        );
    }


    bindBusEvents() {

        this.listeners = {

            counting: () => {
                this.updateCounter();
            }

        };


        this.eventBus.on(
            'load.files',
            this.listeners.counting
        );
    }


    updateCounter() {

        if (!this.counterEl) {
            return;
        }


        const files = this.state.get(
            'load.files',
            {}
        );


        this.counterEl.innerText =
            Object.keys(files).length;
    }


    destroy() {

        this.eventBus.off(
            'load.files',
            this.listeners.counting
        );
    }

}
