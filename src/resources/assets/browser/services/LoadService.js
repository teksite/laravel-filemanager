import Events from "../constants/events.js";
import handler from "../helpers/handler.js";
import ErrorService from "../core/ErrorService.js";

export default class LoadService {

    constructor({url, options = {}}, eventBus, state, requestService, errorService) {

        this.options = {
            endpoint: url ?? "/api/filemanager",
            getOnInit: true,
            ...options
        };

        this.state = state;

        this.eventBus = eventBus;

        this.request = requestService;

        this.errorBus = ErrorService;

        this.bindEvents();

        if (this.options.getOnInit) this.sendRequest();


        this.controller = null;


    }


    bindEvents() {

        this.updateFilter = this.updateFilter.bind(this);

        this.sendRequest = this.sendRequest.bind(this);

        this.eventBus.on(Events.FILES_NEED_MORE, this.sendRequest);

        this.eventBus.on('load.disk', this.updateFilter);

        this.eventBus.on('load.type', this.updateFilter);

    }


    async sendRequest() {


        if (this.state.get("load.loading")) return;

        const hasMore = this.state.get("load.hasMore", true);

        const cursor = this.state.get("load.cursor", null);

        if (!hasMore) return;

        this.controller = new AbortController();
        const signal = this.controller.signal;


        const params = {
            cursor: cursor,
            disk: this.state.get('load.disk', null),
            mime_type: this.state.get('load.type', null),
            per_page: this.options.perPage ?? 25,
            user_id: this.options.userId ?? null,
        };

        await handler({

            resolve: async () => {

                this.state.set("load.loading", true);

                this.eventBus.emit(Events.FILES_REQUEST, {...params, action: 'load more'});

                const response = await this.request.getFiles(params);

                const {files = [], meta = {}} = response;

                this.state.set("load.hasMore", Boolean(meta.has_more));

                this.state.set("load.cursor", meta.next_cursor ?? null);

                this.appendFiles(files);

                this.eventBus.emit(Events.FILES_RECEIVE, {files, meta, action: 'load more'});
            },

            reject: async (error) => {

                this.errorBus?.emit?.(error);

                this.eventBus.emit(Events.FILES_REQUEST_FAILED, error, {action: 'load more'});

                throw error;
            },

            final: () => {
                if (this.controller?.signal === signal) {
                    this.controller = null;
                }

                this.state.set("load.loading", false);
            }

        });
    }


    appendFiles(files = []) {

        const normalizedFiles = Array.isArray(files)
            ? Object.fromEntries(files.map(file => [file.id, file]))
            : files;

        const currentFiles = this.state.get("load.files", {});

        const updatedFiles = {...currentFiles, ...normalizedFiles};


        this.state.set("load.files", updatedFiles);

        this.state.set("load.append", normalizedFiles);
    }


    async updateFilter() {

        if (this.state.get('load.loading')) return;

        this.reset();

        await this.sendRequest();

    }

    reset(files = {}) {

        this.state.set('load.loading', false);

        this.state.set('load.cursor', null);

        this.state.set('load.hasMore', true);

        this.state.set('load.files', files);

        this.state.set('load.append', {});

    }


    stop() {

        this.eventBus.off(Events.FILES_NEED_MORE, this.sendRequest);

        this.eventBus.off(Events.load.disk, this.updateFilter);

        this.eventBus.off(Events.load.type, this.updateFilter);
    }


    destroy() {

        this.stop();

    }
}
