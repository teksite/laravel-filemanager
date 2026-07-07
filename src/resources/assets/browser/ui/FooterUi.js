import {$} from "../helpers/dom.js";

export default class FooterUi {

    constructor({elements = {}} = {}, options = {}, eventBus, stateManager) {

        this.option = {...options}

        this.loadElements(elements)

        this.listeners = [];

        this.eventBus = eventBus;
        this.state = stateManager;
    }


    loadElements(elements) {
        const counterSelector =  elements.counterEl ?? '[data-file-counter]' ;
        this.counterEl = $(counterSelector)
    }

    bindBusEvents() {
        this.listeners = {
            counting: ({value}) => this.counting(value),

        };
        this.eventBus.on('load.files', this.listeners.counting);
    }


    counting() {
        if (!this.counterEl) return;
        const files = this.state.get('load.files')
        this.counterEl.innerText = Object.keys(files).length;

    }

    destroy() {
        this.eventBus.off('load.files', this.listeners.counting);
    }

}
