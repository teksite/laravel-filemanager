import {$, escapeHtml} from "../helpers/dom.js";
import {getMimeGroup, getMimeIcon} from "../helpers/mime.js";

export default class GridUi {

    constructor({gridEl = null} = {}, eventBus, stateManager) {

        const selector = gridEl ?? '[data-grid]';

        this.gridEl = $(selector);

        if (!this.gridEl) return;

        this.eventBus = eventBus;
        this.state = stateManager;

        this.listeners = [];

        this.bindBusEvents();
    }

    bindBusEvents() {
        this.listeners = {
            append: ({value}) => {
                this.appendFile({value})
            },
            prepend :({value})=>{
                this.prependFile({value})

            }
        };
        this.eventBus.on('load.addedFiles', this.listeners.append);
        this.eventBus.on('load.addedFiles', this.listeners.append);

    }


    appendFile({value: items = []}) {

        const fragment = document.createDocumentFragment();

        [...items].forEach(item => {
            const card = this.renderCard(item);
            if (card) fragment.appendChild(card);
        });

        this.gridEl.appendChild(fragment);
    }

    prependFile({value: items = []}) {

        const fragment = document.createDocumentFragment();

        [...items].reverse().forEach(item => {
            const card = this.renderCard(item);
            if (card) fragment.appendChild(card);
        });

        this.gridEl.prepend(fragment);
    }

    renderCard(item) {

        if (!item?.id) return null;

        const card = document.createElement('div');

        card.className = 'media-card';
        card.dataset.id = item.id;
        card.dataset.disk = item.disk || '';
        card.dataset.mime = item.mime_type || '';

        const thumb = document.createElement('div');
        thumb.className = 'media-thumb';

        thumb.innerHTML = this.renderMedia(item);

        card.appendChild(thumb);


        return card;
    }

    renderMedia(item = {}) {

        const mime = item.mime_type || '';
        const type = getMimeGroup(mime);

        switch (type) {

            case 'image':
                return `
                <img src="${item.url}" loading="lazy" alt="${escapeHtml(item.title || item.original_name || '')}">`;

            case 'video':
                return `<video src="${item.url}" preload="metadata"></video>`;

            case 'audio':
                return `
                <audio src="${item.url}" preload="metadata"></audio>`;

            default:
                return `<div class="media-fallback"><span class="icon">${getMimeIcon(mime)}</span></div>`;
        }
    }


    destroy() {
        this.eventBus.off('load.addedFiles', this.listeners.appendFile);

    }

}
