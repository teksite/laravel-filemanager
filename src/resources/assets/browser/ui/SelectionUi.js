import {$} from "../helpers/dom.js";
import events from "../constants/events.js";

export default class SelectionUi {

    constructor({elements = {}} = {}, options = {}, eventBus, stateManager) {

        this.option = {...options}

        this.loadElements(elements)

        this.listeners = [];

        this.eventBus = eventBus;
        this.state = stateManager;

        this.bindUiEvents();
    }


    loadElements(elements) {
        const mimesSelector = elements.mimesEl ?? '[data-mimeList]';
        const disksSelector = elements.disksEl ?? '[data-diskList]';
        this.mimesEl = $(mimesSelector);
        this.disksEl = $(disksSelector);
    }

    bindUiEvents() {
        this.updateTypeFilter = this.updateTypeFilter.bind(this);
        this.updateDiskFilter = this.updateDiskFilter.bind(this);

        this.mimesEl?.addEventListener('change', this.updateTypeFilter);
        this.disksEl?.addEventListener('change', this.updateDiskFilter);


    }

    updateDiskFilter(e) {
        const target = e.target;
        const value = target.value.length > 0 ? target.value : null;

        this.state.set('load.disk', value);
        this.eventBus.emit(events.GRID_CLEAR, {value})
    }

    updateTypeFilter(e) {
        const target = e.target;
        const value = target.value.length > 0 ? target.value : null;

        this.state.set('load.type', value);
        this.eventBus.emit(events.GRID_CLEAR, {value})
    }


    destroy() {
        this.mimesEl?.removeEventListener('change', this.updateTypeFilter)
        this.disksEl?.removeEventListener('change', this.updateDiskFilter)
    }

}
