import {$} from "../helpers/dom.js";
import SelectService from "../services/SelectService.js";
import events from "../constants/events.js";
import {renderMedia} from "../helpers/preview.js";

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
            appendItem: () => {
                this.appendItem();
            }
        };
        this.eventBus.on(events.SELECTION_CLICK, this.listeners.appendItem);
    }

    appendItem() {
        const files = this.state.get('select.files');

        if (files == null) {
            this.gridEl.innerHTML = '';
            return;
        }

        if ('id' in files) {
            this.gridEl.innerHTML = this.renderItems(files);
            return;
        }

        this.gridEl.innerHTML = '';

        Object.values(files).forEach(file => {
            this.gridEl.insertAdjacentHTML('beforeend', this.renderItems(file));
        });
    }
    renderItems(file) {

       return `<div class="selected-item">
${renderMedia(file)}
<button class="selected-item-delete-btn">
✖
</button>
</div>`;
    }


    destroy() {

        this.eventBus.off(events.SELECTION_CLICK, this.listeners.counting);
    }

}
