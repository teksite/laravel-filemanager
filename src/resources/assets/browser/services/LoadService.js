import {$} from "../helpers/dom.js";
import Events from "../constants/events.js";
import events from "../constants/events.js";

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

        this.eventBus = eventBus;
        this.state = state;
        this.request = requestService;
        this.errorBus = errorService;

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
        const loading = this.state.get('load.loading');
        if (loading) return;

        const hasMore = this.state.get('load.hasMore');
        if (!hasMore) return;

        const cursor = this.state.get('load.hasMore');
        const disk = this.state.get('load.disk');
        const mime_type = this.state.get('load.type');

        const {files, meta} = await this.request.getFiles({
            cursor,
            mime_type,
            disk
        });

        this.eventBus.emit(events.FILES_LOADED, {
            files,
            meta
        });

        this.state.set('load.hasMore', meta.has_more)
        this.state.set('load.hasMore', meta.cursor);
        this.setFiles(files);


    }


    setFiles(files = []) {
        this.state.set('load.files', files);

    }

    stop() {

    }

    destroy() {
        this.stop();
        this.gridEl.removeEventListener('click', this.handlers.select);
        this.loadMoreEl?.removeEventListener('click', this.handlers.more);

    }
}
