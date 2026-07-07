import Events from "../constants/events.js";
import handler from "../helpers/handler.js";

export default class SelectService {

    constructor({url, options = {}}, eventBus, state, requestService, errorService) {

        this.options = {
            endpoint: url ?? "/api/filemanager",
            getOnInit: true,
            ...options
        };

        this.eventBus = eventBus;
        this.state = state;
        this.request = requestService;
        this.errorBus = errorService;

        this.sendRequest = this.sendRequest.bind(this);

        this.bindEvents();

        if (this.options.getOnInit) {
            this.sendRequest();
        }
    }

    bindEvents() {
        this.eventBus.on(Events.FILES_NEED_MORE, this.sendRequest);
    }

    async sendRequest() {

        if (this.state.get("load.loading")) {
            return;
        }

        const hasMore = this.state.get("load.hasMore", true);
        const cursor = this.state.get("load.cursor", null);

        if (cursor === null && hasMore === false) {
            return;
        }

        const disk = this.state.get("load.disk", null);
        const mimeType = this.state.get("load.type", null);

        await handler({
            resolve: async () => {
                this.state.set("load.loading", true);

                this.eventBus.emit(Events.FILES_REQUEST, {cursor, disk, mime_type: mimeType});

                const response = await this.request.getFiles({cursor, disk, mime_type: mimeType});

                const {files = [], meta = {}} = response;

                this.state.set("load.hasMore", !!meta.has_more);
                this.state.set("load.cursor", meta.next_cursor ?? null);

                this.appendFiles(files);

                this.eventBus.emit(Events.FILES_RECEIVE, {files, meta});
            },

            reject: async (error) => {

                this.errorBus?.emit?.(error);

                this.eventBus.emit(Events.FILES_REQUEST_FAILED, error);
            },

            final: () => {
                this.state.set("load.loading", false);
            }

        });

    }

    appendFiles(files = []) {

        const current = this.state.get("load.files", []);

        const map = new Map();

        [...current, ...files].forEach(file => {
            map.set(file.id, file);
        });

        const updated = [...map.values()];

        this.state.set("load.addedFiles", files);
        this.state.set("load.files", updated);
    }

    reset(files = []) {

        this.state.set('load.cursor', null);
        this.state.set('load.hasMore', true);
        this.state.set('load.files', files);
        this.state.set('load.addedFiles', files);
    }

    stop() {
        this.eventBus.off(Events.FILES_NEED_MORE, this.sendRequest);

    }

    destroy() {
        this.stop();
    }
}
