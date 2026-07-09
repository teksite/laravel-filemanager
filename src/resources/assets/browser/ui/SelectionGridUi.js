import {$} from "../helpers/dom.js";

export default class SelectionGridUi {

    constructor({elements = {}} = {}, options = {}, eventBus, stateManager) {

        this.options = {...options};

        this.loadElements(elements);

        this.listeners = {};

        this.eventBus = eventBus;
        this.state = stateManager;

        this.bindBusEvents();

    }


    loadElements(elements) {
        this.gridEl = $(elements.counterEl ?? '[data-selected-list]');
    }


    bindBusEvents() {
        this.appendItem = this.appendItem.bind(this);

        this.listeners = {
            appendItem: ({value}) => {
                this.appendItem(value);
            }
        };
        this.eventBus.on('select.files', this.listeners.appendItem);
    }


    appendItem(files) {

    }


    destroy() {

        this.eventBus.off('load.files', this.listeners.counting);
    }

}
