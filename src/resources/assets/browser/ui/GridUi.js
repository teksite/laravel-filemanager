import {$, escapeHtml} from "../helpers/dom.js";
import {getMimeGroup, getMimeIcon} from "../helpers/mime.js";
import events from "../constants/events.js";

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


        this.eventBus.on(events.GRID_RESET, this.listeners.emptyGrid);

        this.eventBus.on('load.addedFiles', this.listeners.append);

        this.eventBus.on('load.loading', this.listeners.toggleLoading);

        // this.eventBus.on(events.UPLOAD_SUCCESS, this.listeners.prepend);

        this.eventBus.on(events.FILE_DELETED, this.listeners.remove);
    }


    bindUiEvents() {

        this.loadPreview = this.loadPreview.bind(this);

        this.gridEl.addEventListener('click', this.loadPreview);
    }


    appendFile(items = {}) {

        const fragment = document.createDocumentFragment();


        Object.values(items).forEach(item => {

            const card = this.renderCard(item);

            if (card) {
                fragment.appendChild(card);
            }

        });


        this.gridEl.appendChild(fragment);
    }


    prependFile(items = {}) {

        const fragment = document.createDocumentFragment();


        Object.values(items)
            .reverse()
            .forEach(item => {

                const card = this.renderCard(item);

                if (card) {
                    fragment.appendChild(card);
                }

            });


        this.gridEl.prepend(fragment);
    }


    renderCard(item) {

        if (!item?.id) {
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

        thumb.innerHTML = this.renderMedia(item);


        card.appendChild(thumb);


        return card;
    }


    renderMedia(item = {}) {

        const mime = item.mime_type ?? '';

        const type = getMimeGroup(mime);


        switch (type) {

            case 'image':

                return `
                    <img
                        src="${item.url}"
                        loading="lazy"
                        alt="${escapeHtml(item.title ?? item.original_name ?? '')}"
                    >
                `;


            case 'video':

                return `
                    <video
                        src="${item.url}"
                        preload="metadata">
                    </video>
                `;


            case 'audio':

                return `
                    <audio
                        src="${item.url}"
                        preload="metadata">
                    </audio>
                `;


            default:

                return `
                    <div class="media-fallback">
                        <span class="icon">
                            ${getMimeIcon(mime)}
                        </span>
                    </div>
                `;
        }
    }


    toggleLoading(value) {

        if (!this.loadingEl) {
            return;
        }


        if (this.options.loadingStyle === 'overlay') {

            this.loadingEl.style.display =
                value ? 'flex' : 'none';

            return;
        }


        this.loadingEl.style.display =
            value ? 'block' : 'none';


        this.loadingEl.style.position =
            value ? 'static' : '';
    }


    emptyGrid() {
        this.gridEl.innerHTML = '';
    }


    loadPreview(e) {

        e.preventDefault();


        const card = e.target.closest('[data-media-card]');


        if (!card) {
            return;
        }


        const fileId = card.dataset.id;


        if (!fileId) {
            return;
        }


        this.state.set(
            'select.current',
            fileId
        );
    }


    removeFile(fileId) {

        if (!fileId) {
            return;
        }


        const card = this.gridEl.querySelector(
            `[data-media-card][data-id="${CSS.escape(fileId)}"]`
        );


        card?.remove();
    }


    destroy() {

        this.eventBus.off(
            'load.addedFiles',
            this.listeners.append
        );


        this.eventBus.off(
            'load.loading',
            this.listeners.toggleLoading
        );


        this.eventBus.off(
            events.UPLOAD_SUCCESS,
            this.listeners.prepend
        );


        this.eventBus.off(
            events.GRID_RESET,
            this.listeners.emptyGrid
        );


        this.eventBus.off(
            events.FILE_DELETED,
            this.listeners.remove
        );


        this.gridEl.removeEventListener(
            'click',
            this.loadPreview
        );
    }

}
