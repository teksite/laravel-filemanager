import {$} from "../helpers/dom.js";
import events from "../constants/events.js";
import {renderMedia} from "../helpers/preview.js";

export default class GridUi {

    constructor({elements = {}} = {}, options = {}, eventBus, stateManager) {

        this.options = {loadingStyle: 'overlay', ...options};

        const gridSelector = elements.gridEl ?? '[data-grid]';
        const loadingSelector = elements.loadingEl ?? '[data-loading]';


        this.gridEl = $(gridSelector);
        this.loadingEl = $(loadingSelector);


        if (!this.gridEl) return;

        this.listeners = {};

        this.eventBus = eventBus;
        this.state = stateManager;


        this.bindBusEvents();
        this.bindUiEvents();
    }


    bindBusEvents() {

        this.listeners = {

            append: ({value}) => {
                this.appendFile(value);
            },

            prepend: ({file: value}) => {
                this.prependFile(value);
            },

            toggleLoading: ({value}) => {
                this.toggleLoading(value);
            },

            remove: ({fileId}) => {
                this.removeFile(fileId);
            },

            emptyGrid: () => {
                this.emptyGrid();
            },
        };


        this.eventBus.on(events.GRID_CLEAR, this.listeners.emptyGrid);

        this.eventBus.on('load.append', this.listeners.append);

        this.eventBus.on('load.loading', this.listeners.toggleLoading);

        this.eventBus.on(events.UPLOAD_SUCCESS, this.listeners.prepend);

        this.eventBus.on(events.FILE_DELETED, this.listeners.remove);
    }


    bindUiEvents() {

        this.selectingAction = this.selectingAction.bind(this);

        this.gridEl.addEventListener('click', this.selectingAction);
    }


    appendFile(items = {}) {

        if (!items || Object.keys(items).length === 0) {
            return;
        }

        const fragment = document.createDocumentFragment();

        Object.values(items).forEach(item => {

            const card = this.renderCard(item);

            if (card) fragment.appendChild(card);
        });

        this.gridEl.appendChild(fragment);
        this.eventBus.emit(events.GRID_UPDATED, {items, 'action': 'append file'})

        this.state.set('load.append', {});
    }


    prependFile(items = {}) {

        const fragment = document.createDocumentFragment();

        Object.values(items).reverse().forEach(item => {

            const card = this.renderCard(item);

            if (card) fragment.appendChild(card);
        });

        this.gridEl.prepend(fragment);
        this.eventBus.emit(events.GRID_UPDATED, {items, 'action': 'prepend file'})
    }


    renderCard(item) {

        if (!item?.id) return null;

        const card = document.createElement('div');

        card.className = 'media-card';

        card.dataset.mediaCard = '';

        card.dataset.id = item.id;

        card.dataset.disk = item.disk ?? '';

        card.dataset.mime = item.mime_type ?? '';


        const thumb = document.createElement('div');

        thumb.className = 'media-thumb';

        thumb.innerHTML = renderMedia(item);

        card.appendChild(thumb);

        return card;
    }


    toggleLoading(value) {

        if (!this.loadingEl) return;

        this.loadingEl.style.display = value ? 'flex' : 'none';

        this.loadingEl.style.top = this.options.loadingStyle === 'overlay'
            ? '0'
            : 'calc(100% - 25px)';
    }


    emptyGrid() {
        this.gridEl.innerHTML = '';
        this.eventBus.emit(events.GRID_CLEARED, {});
    }


    selectingAction(e) {
        e.preventDefault();

        const card = e.target.closest('[data-media-card]');

        console.log(card)
        if (!card) return;

        const fileId = card.dataset.id;

        console.log(fileId)
        if (!fileId) return;

        this.state.set('select.current', fileId);
        this.eventBus.emit(events.SELECTION_CLICK, {fileId});
    }


    removeFile(fileId) {

        if (!fileId) return;

        const card = this.gridEl.querySelector(`[data-media-card][data-id="${CSS.escape(fileId)}"]`);

        card?.remove();
    }


    destroy() {

        this.eventBus.off('load.append', this.listeners.append);

        this.eventBus.off('load.loading', this.listeners.toggleLoading);

        this.eventBus.off(
            events.UPLOAD_SUCCESS,
            this.listeners.prepend
        );


        this.eventBus.off(events.GRID_CLEAR, this.listeners.emptyGrid);

        this.eventBus.off(events.FILE_DELETED, this.listeners.remove);

        this.gridEl.removeEventListener('click', this.selectingAction);
    }

}
