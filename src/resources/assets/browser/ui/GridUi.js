import {$} from "../helpers/dom.js";
import {getMimeGroup} from "../helpers/mime.js";

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
            append: ({value , prev}) => {
                this.appendFile({value , prev})
            },
        };
        this.eventBus.on('load.addedFiles', this.listeners.append);

    }


    appendFile({value =[], prev=[]}){
       const renderedItems = value
           .map(item=>this.renderCard(item))
           .join('')
    }


    renderCard(item){

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
                <img
                    src="${escapeUrl(item.url)}"
                    loading="lazy"
                    alt="${escapeHtml(item.title || item.original_name || '')}"
                >
            `;

            case 'video':
                return `
                <video
                    src="${escapeUrl(item.url)}"
                    preload="metadata"
                ></video>
            `;

            case 'audio':
                return `
                <audio
                    src="${escapeUrl(item.url)}"
                    preload="metadata"
                ></audio>
            `;

            default:
                return `
                <div class="media-fallback">
                    <span class="icon">${getMimeIcon(mime)}</span>
                </div>
            `;
        }
    }

    /**
     * Render small preview (selection sidebar)
     */
    renderSmallMedia(item = {}) {

        const mime = item.mime_type || '';
        const type = getMimeGroup(mime);

        switch (type) {

            case 'image':
                return `<img src="${escapeUrl(item.url)}" alt="">`;

            case 'video':
                return `🎬`;

            case 'audio':
                return `🎵`;

            default:
                return `📄`;
        }
    }



    destroy() {
        this.eventBus.off('load.addedFiles', this.listeners.appendFile);

    }

}
