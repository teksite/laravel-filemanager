import {$} from "../helpers/dom.js";
import Events from "../constants/events.js";

export default class LoadService {

    constructor({url, elements = {}, options = {}}, eventBus, state, requestService, errorService) {

        this.options = {
            endpoint: url ?? '/api/filemanager',
            ...options
        };
        this.handlers = [];


        this.loadElements(elements);

        if (!this.gridEl) return;

        this.bindUI();

        this.eventBus= eventBus;
        this.state= state;
        this.request= requestService;
        this.errorBus= errorService;

        if (this.options.getOnInit ?? true) this.sendRequest();

    }

    loadElements(elements) {

        this.gridEl = $(elements.gridEl ?? '[data-grid]');

        this.loadingEl = $(elements.loadingEl ?? '[data-loading]');

        this.loadMoreEl = $(elements.loadMoreEl ?? '[data-load-more]');

        this.mimesEl = $(elements.mimesEl ?? '[data-diskList]');

        this.disksEl = $(elements.disksEl ?? '[data-mimeList]');
    }

    bindUI() {
        if (!this.gridEl) return;

        this.handlers = {
            select: (e) => {
                e.preventDefault();
            },

            more: (e) => {
                e.preventDefault();
                this.sendRequest();
            },
        };
        this.gridEl.addEventListener('click', this.handlers.select);

        this.loadMoreEl?.addEventListener('click', this.handlers.more);

    }

    async sendRequest() {

        const res = await this.request.getFiles();
        console.log(res)


    }



    setFiles(files = []) {

    }

    stop() {

    }

    destroy() {
        this.stop();
        this.gridEl.removeEventListener('click', this.handlers.select);
        this.loadMoreEl?.removeEventListener('click', this.handlers.more);

    }
}
