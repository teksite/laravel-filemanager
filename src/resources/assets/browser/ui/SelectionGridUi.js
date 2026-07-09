import {$} from "../helpers/dom.js";
import Events from "../constants/events.js";
import {renderMedia} from "../helpers/preview.js";

export default class SelectionGridUi {

    constructor({elements = {}} = {}, options = {}, eventBus, stateManager) {

        this.options = {...options};

        this.loadElements(elements);

        if (!this.gridEl) return;

        this.listeners = {};

        this.state = stateManager;

        this.eventBus = eventBus;

        this.bindBusEvents();

        this.bindDomEvents();

    }


    loadElements(elements) {

        this.gridEl = $(elements.gridEl ?? '[data-selected-list]');
    }


    bindDomEvents() {

        this.handleDeleteClick = this.handleDeleteClick.bind(this);

        this.gridEl.addEventListener('click', this.handleDeleteClick);

    }

    bindBusEvents() {

        this.appendItem = this.appendItem.bind(this);

        this.clearGrid = this.clearGrid.bind(this);

        this.removeItemFromGrid = this.removeItemFromGrid.bind(this);

        this.listeners = {
            appendItem: () => {

                this.appendItem();
            },

            removeItemFromGrid: ({fileId}) => {
                this.removeItemFromGrid(fileId);

            },
            clearGrid: () => {
                this.clearGrid();

            },
        };
        this.eventBus.on(Events.SELECTION_CLICK, this.listeners.appendItem);

        this.eventBus.on(Events.SELECTION_ON_CHOOSE, this.listeners.clearGrid);

        this.eventBus.on(Events.SELECTION_REMOVED, this.listeners.removeItemFromGrid);

    }

    appendItem() {
        const files = this.state.get('select.files');

        if (files == null) {

            this.clearGrid();

            return;
        }

        if ('id' in files) {
            this.gridEl.innerHTML = this.renderItems(files);

            return;
        }

        this.clearGrid();

        Object.values(files).forEach(file => {

            this.gridEl.insertAdjacentHTML('beforeend', this.renderItems(file));

        });
    }

    clearGrid() {
        this.gridEl.innerHTML = '';

    }

    renderItems(file) {

        return `
        <div class="selected-item" data-selected-item  data-id="${file.id}">
            ${renderMedia(file)}
            <button class="selected-item-delete-btn"  data-selected-remove data-id="${file.id}">
                ✖
            </button>
        </div>
    `;
    }

    handleDeleteClick(e) {

        const btn = e.target.closest('.selected-item-delete-btn');

        if (!btn) return;

        const fileId = btn.dataset.id;

        this.eventBus.emit(Events.SELECTION_REMOVE_SIGNAL, {fileId});

    }

    removeItemFromGrid(fileId) {

        if (!fileId) return;

        const parentItem = this.gridEl.querySelector(`[data-selected-item][data-id='${fileId}']`);

        parentItem?.remove();
    }


    destroy() {

        this.gridEl?.removeEventListener('click', this.handleDeleteClick);

        this.eventBus.off(Events.SELECTION_CLICK, this.listeners.appendItem);

        this.eventBus.off(Events.SELECTION_ON_CHOOSE, this.listeners.clearGrid);

        this.eventBus.off(Events.SELECTION_REMOVED, this.listeners.removeItemFromGrid);

    }

}
