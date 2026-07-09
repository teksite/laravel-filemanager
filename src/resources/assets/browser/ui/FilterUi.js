import {$} from "../helpers/dom.js";
import Events from "../constants/events.js";

export default class FilterUi {

    constructor({elements = {}} = {}, options = {}, eventBus, stateManager) {

        this.options = {...options}

        this.loadElements(elements);

        this.listeners = {};

        this.state = stateManager;

        this.eventBus = eventBus;

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

        const value = e.currentTarget.value || null;

        this.state.set('load.disk', value);

        this.eventBus.emit(Events.GRID_CLEAR, {value})
    }

    updateTypeFilter(e) {
        const target = e.target;

        const value = e.currentTarget.value || null;

        this.state.set('load.type', value);

    }


    destroy() {

        this.mimesEl?.removeEventListener('change', this.updateTypeFilter)

        this.disksEl?.removeEventListener('change', this.updateDiskFilter)
    }

}
