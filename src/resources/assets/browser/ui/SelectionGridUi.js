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
        this.bindUiEvents();

    }


    loadElements(elements) {
        this.gridEl = $(elements.counterEl ?? '[data-selected-list]');
    }


    bindBusEvents() {
        this.handleDeleteClick = this.handleDeleteClick.bind(this);

        this.gridEl.addEventListener('click', this.handleDeleteClick);
    }

    bindUiEvents() {
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

        return `
        <div class="selected-item">
            ${renderMedia(file)}
            <button class="selected-item-delete-btn" data-id="${file.id}">
                ✖
            </button>
        </div>
    `;
    }

    handleDeleteClick(e) {
        const btn = e.target.closest('.selected-item-delete-btn');

        if (!btn) return;

        this.eventBus.emit(events.SELECTION_REMOVE, {fileId: btn.dataset.id});
    }


    destroy() {
        this.gridEl.removeEventListener('click', this.handleDeleteClick);

        this.eventBus.off(events.SELECTION_CLICK, this.listeners.counting);
    }

}
