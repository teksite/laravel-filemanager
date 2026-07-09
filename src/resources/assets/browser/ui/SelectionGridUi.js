import {$} from "../helpers/dom.js";

export default class SelectionGridUi {

    constructor({elements = {}} = {}, options = {}, eventBus, stateManager) {

        this.options = {...options};

        this.loadElements(elements);

        this.listeners = {};

        this.eventBus = eventBus;
        this.state = stateManager;

        this.bindBusEvents();

        console.log(this.gridEl)
    }


    loadElements(elements) {

        this.gridEl = $(elements.counterEl ?? '[data-selected-list]');
    }


    bindBusEvents() {
        this.listeners = {
            counting: () => {
                this.updateCounter();
            }

        };

        this.eventBus.on('load.files', this.listeners.counting);
    }


    updateCounter() {

        if (!this.counterEl) return;

        const files = this.state.get('load.files', {});

        this.counterEl.innerText = Object.keys(files).length;
    }


    destroy() {

        this.eventBus.off('load.files', this.listeners.counting);
    }

}
