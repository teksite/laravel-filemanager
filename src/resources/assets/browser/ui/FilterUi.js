import {$} from "../helpers/dom.js";

export default class FilterUi {

    constructor({elements = {}} = {}, options = {}, eventBus, stateManager) {

        this.option = {...options}

        this.loadElements(elements)

        this.listeners = [];

        this.eventBus = eventBus;
        this.state = stateManager;

        this.bindUiEvents();
    }


    loadElements(elements) {
        const mimesSelector = elements.counterEl ?? '[data-mimeList]';
        const disksSelector = elements.counterEl ?? '[data-diskList]';
        this.mimesEl = $(mimesSelector);
        this.disksEl = $(disksSelector);
    }

    bindUiEvents() {
        this.updateTypeFilter = this.updateTypeFilter.bind(this)
        this.updateDiskFilter = this.updateDiskFilter.bind(this)
        this.mimesEl?.addEventListener('change', this.updateTypeFilter)
        this.disksEl?.addEventListener('change', this.updateDiskFilter)


    }


    updateTypeFilter(e) {
        console.log(e)
        this.state.set('load.disk',e.target.value);
    }

    updateDiskFilter(e) {
        this.state.set('load.type',e.target.value);
    }

    destroy() {
        this.mimesEl?.removeEventListener('change', this.updateTypeFilter)
        this.disksEl?.removeEventListener('change', this.updateDiskFilter)
        this.eventBus.off('load.files', this.listeners.counting);
    }

}
