import Events from "../constants/events.js";
import {renderMedia} from "../helpers/preview.js";
import UiService from "../Foundation/UiService.js";


export default class GridUi extends UiService {

    defineElements() {

        return {
            gridEl: this.config.get('ui.gridSelector', '[data-grid]'),

            loadingEl: this.config.get('ui.loadingSelector', '[data-loading]')
        };
    }


    shouldInitialize() {

        return Boolean(this.gridEl);
    }


    busEvents() {

        return {

            [Events.GRID_CLEAR]: () => {
                this.emptyGrid();
            },

            'load.append': ({value}) => {
                this.appendFile(value);
            },

            'load.loading': ({value}) => {
                this.toggleLoading(value);
            },

            [Events.UPLOAD_SUCCESS]: ({response}) => {
                this.prependFile(response);
            },

            [Events.FILE_DELETED]: ({fileId}) => {
                this.removeFile(fileId);
            },

            [Events.FILE_DELETE_FAILED]: ({fileId}) => {
                this.unHideItem(fileId);
            },

            [Events.FILE_DELETE_SIGNAL]: ({fileId}) => {
                this.hideItem(fileId);
            },

            [Events.FILE_UPDATED_TITLE]: ({fileId, title, file}) => {
                this.updateTitle(fileId, title, file);
            }
        };
    }

    domEvents() {

        return [
            [
                this.gridEl, 'click', this.selectingAction
            ]
        ];
    }


    appendFile(items = {}) {

        if (!items || Object.keys(items).length === 0) return;

        const fragment = document.createDocumentFragment();

        Object.values(items).forEach(item => {

            const card = this.renderCard(item);

            if (card) fragment.appendChild(card);
        });

        this.gridEl.appendChild(fragment);

        this.eventBus.emit(Events.GRID_UPDATED, {items, action: 'append file'});

        this.state.set('load.append', {});

    }


    prependFile(item) {

        if (!item) return;

        this.updateLoadedFiles({prepend: item})

        const fragment = document.createDocumentFragment();

        const card = this.renderCard(item);

        if (card) fragment.appendChild(card);

        this.gridEl.prepend(fragment);

        this.eventBus.emit(Events.GRID_UPDATED, {items: item, action: 'prepend file'});

    }

    prependManyFile(items) {

        if (!items || Object.keys(items).length === 0) return;

        const fragment = document.createDocumentFragment();

        Object.values(items).reverse().forEach(item => {

            const card = this.renderCard(item);

            if (card) fragment.appendChild(card);
        });

        this.gridEl.prepend(fragment);

        this.eventBus.emit(Events.GRID_UPDATED, {items, action: 'prepend file'});
    }


    renderCard(item) {

        if (!item?.id) return null;

        const exists = this.gridEl.querySelector(`[data-media-card][data-id="${CSS.escape(item.id)}"]`);

        if (exists) return null;

        const card = document.createElement('div');

        card.className = 'media-card';

        Object.assign(card.dataset, {mediaCard: '', id: item.id, disk: item.disk ?? '', mime: item.mime_type ?? ''});


        const thumb = document.createElement('div');

        thumb.className = 'media-thumb';

        thumb.dataset.mediaThumb = '';

        thumb.innerHTML = renderMedia(item);

        card.appendChild(thumb);

        return card;
    }


    toggleLoading(value) {

        if (!this.loadingEl) return;

        this.loadingEl.classList.toggle('show', Boolean(value));
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

        (fileId === (this.state.get('select.current', null)) ?? null)

            ? this.state.set('select.current', null)

            : this.state.set('select.current', fileId);

        this.eventBus.emit(Events.SELECTION_CLICK, {fileId});
    }


    removeFile(fileId) {

        if (!fileId) return;

        const card = this.gridEl.querySelector(`[data-media-card][data-id="${CSS.escape(fileId)}"]`);

        card?.remove();
    }


    hideItem(fileId) {

        const card = this.findCard(fileId);

        if (!card) return;

        card.hidden = true;

        card.classList.add('is_hidden');
    }


    unHideItem(fileId) {


        const card = this.findCard(fileId);


        if (!card) return;

        card.hidden = false;

        card.classList.remove('is_hidden');


    }


    findCard(fileId) {

        if (!fileId) return null;

        return this.gridEl.querySelector(`[data-media-card][data-id="${CSS.escape(fileId)}"]`);
    }


    updateTitle(fileId, title, file) {

        if (!fileId) return;


        const newTitle = title ?? file?.title ?? file?.original_name ?? 'UNKNOWN';

        this.$$(`[data-id="${CSS.escape(fileId)}"] [data-item-name]`).forEach(item => {

            item.textContent = newTitle;
        });
    }

    updateLoadedFiles({prepend = {}, append = {}}) {

        const oldFiles = this.state.get('load.files');

        const prependFie = prepend?.id ? {[prepend.id]: prepend} : {}

        const appendFie = append?.id ? {[append.id]: append} : {}

        const next = {...prependFie, ...oldFiles, ...appendFie}

        this.state.set('load.files', next);
    }
}
