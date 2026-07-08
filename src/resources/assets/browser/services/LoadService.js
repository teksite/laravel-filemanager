import Events from "../constants/events.js";
import handler from "../helpers/handler.js";

export default class LoadService {

    constructor({url, options = {}}, eventBus, state, requestService, errorService) {

        this.options = {
            endpoint: url ?? "/api/filemanager",
            getOnInit: true,
            ...options
        };


        this.eventBus = eventBus;
        this.state = state;
        this.request = requestService;
        this.errorBus = requestService;

        this.bindEvents();

        if (this.options.getOnInit) this.sendRequest();

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

        const disk = this.state.get('load.disk', null);

        const mimeType = this.state.get('load.type', null);

        const perPage = this.options.perPage ?? 25;

        const userId = this.options.userId ?? null;


        const params = {
            cursor: cursor,
            disk: disk,
            mime_type: mimeType,
            per_page: perPage,
            user_id: userId,
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
            },

            final: () => {
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
    }


    destroy() {
        this.stop();
    }
}
