import {$, $$} from "../helpers/dom.js";
import Events from "../constants/events.js";
import {renderMedia} from "../helpers/preview.js";

export default class GridUi {

    constructor({elements = {}} = {}, options = {}, eventBus, stateManager) {

        this.loadElements(elements);

        if (!this.gridEl) return;

        this.listeners = {};

        this.state = stateManager;

        this.eventBus = eventBus;


        this.bindBusEvents();

        this.bindUiEvents();
    }

    loadElements(elements) {

        const gridSelector = elements.gridEl ?? '[data-grid]';

        const loadingSelector = elements.loadingEl ?? '[data-loading]';


        this.gridEl = $(gridSelector);

        this.loadingEl = $(loadingSelector);
    }


    bindBusEvents() {
        this.updateTitle = this.updateTitle.bind(this)

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

            hideItem: ({fileId}) => {
                this.hideItem(fileId);
            },


            unHideItem: ({fileId}) => {
                this.unHideItem(fileId);
            },


            updateTitle: ({fileId, title, file}) => {
                this.updateTitle(fileId, title, file);
            },

            emptyGrid: () => {
                this.emptyGrid();
            },
        };


        this.eventBus.on(Events.GRID_CLEAR, this.listeners.emptyGrid);

        this.eventBus.on('load.append', this.listeners.append);

        this.eventBus.on('load.loading', this.listeners.toggleLoading);

        this.eventBus.on(Events.UPLOAD_SUCCESS, this.listeners.prepend);

        this.eventBus.on(Events.FILE_DELETED, this.listeners.remove);

        this.eventBus.on(Events.FILE_DELETE_FAILED, this.listeners.unHideItem);

        this.eventBus.on(Events.FILE_DELETE_SIGNAL, this.listeners.hideItem);

        this.eventBus.on(Events.FILE_UPDATED_TITLE, this.listeners.updateTitle);

    }


    bindUiEvents() {

        this.selectingAction = this.selectingAction.bind(this);
        this.hideItem = this.hideItem.bind(this);

        this.gridEl.addEventListener('click', this.selectingAction);
    }


    appendFile(items = {}) {

        if (!items || Object.keys(items).length === 0) return;

        const fragment = document.createDocumentFragment();

        Object.values(items).forEach(item => {

            const card = this.renderCard(item);

            if (card) fragment.appendChild(card);
        });

        this.gridEl.appendChild(fragment);
        this.eventBus.emit(Events.GRID_UPDATED, {items, 'action': 'append file'})

        this.state.set('load.append', {});
    }


    prependFile(items = {}) {

        const fragment = document.createDocumentFragment();

        Object.values(items).reverse().forEach(item => {

            const card = this.renderCard(item);

            if (card) fragment.appendChild(card);
        });

        this.gridEl.prepend(fragment);
        this.eventBus.emit(Events.GRID_UPDATED, {items, 'action': 'prepend file'})
    }


    renderCard(item) {

        if (!item?.id) return null;

        if (this.gridEl.querySelector(`[data-media-card][data-id="${CSS.escape(item.id)}"]`)) {
            return null;
        }

        const card = document.createElement('div');

        card.className = 'media-card';

        card.dataset.mediaCard = '';

        card.dataset.id = item.id;

        card.dataset.disk = item.disk ?? '';

        card.dataset.mime = item.mime_type ?? '';


        const thumb = document.createElement('div');

        thumb.className = 'media-thumb';

        thumb.dataset.mediaThumb = '';

        thumb.innerHTML = renderMedia(item);

        card.appendChild(thumb);

        return card;
    }


    toggleLoading(value) {

        if (!this.loadingEl) return;

        value
            ? this.loadingEl.classList.add('show')
            : this.loadingEl.classList.remove('show');

    }


    emptyGrid() {
        this.gridEl.innerHTML = '';
        this.eventBus.emit(Events.GRID_CLEARED, {});
    }


    selectingAction(e) {

        const card = e.target.closest('[data-media-card]');

        if (!card) return;

        const fileId = card.dataset.id;

        if (!fileId) return;

        this.state.set('select.current', fileId);
        this.eventBus.emit(Events.SELECTION_CLICK, {fileId});
    }


    removeFile(fileId) {

        if (!fileId) return;

        const card = this.gridEl.querySelector(`[data-media-card][data-id="${CSS.escape(fileId)}"]`);

        card?.remove();
    }


    unHideItem(fileId) {

        if (!fileId) return;

        const card = this.gridEl.querySelector(`[data-media-card][data-id="${CSS.escape(fileId)}"]`);

        if (card) card.style.display = 'block';
        if (card) card.classList.remove( 'is_hidden');
    }

    hideItem(fileId) {

        if (!fileId) return;

        const card = this.gridEl.querySelector(`[data-media-card][data-id="${CSS.escape(fileId)}"]`);

        if (card) card.style.display = 'none';
        if (card) card.classList.add( 'is_hidden');


    }

    updateTitle(fileId, title, file) {

        if (!fileId) return;

        const newTitle = title ?? file?.title ?? file?.original_name ?? 'UNKNOWN';

        if (!newTitle) return;

        $$(`[data-id="${fileId}"] [data-item-name]`)
            .forEach(item => {
                item.textContent = newTitle;
            });
    }


    destroy() {

        this.eventBus.off('load.append', this.listeners.append);

        this.eventBus.off('load.loading', this.listeners.toggleLoading);

        this.eventBus.off(Events.UPLOAD_SUCCESS, this.listeners.prepend);


        this.eventBus.off(Events.GRID_CLEAR, this.listeners.emptyGrid);

        this.eventBus.off(Events.FILE_DELETED, this.listeners.remove);

        this.eventBus.off(Events.FILE_DELETE_FAILED, this.listeners.unHideItem);

        this.eventBus.on(Events.FILE_DELETE_SIGNAL, this.listeners.hideItem);

        this.eventBus.off(Events.FILE_UPDATED_TITLE, this.listeners.updateTitle);

        this.gridEl?.removeEventListener('click', this.selectingAction);


    }

}
