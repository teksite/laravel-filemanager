import Events from "../constants/events.js";

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

        if (this.state.get('load.loading')) return;

        const hasMore = this.state.get('load.hasMore', true);
        const cursor = this.state.get('load.cursor', null);

        if (!cursor && !hasMore) return;

        const disk = this.state.get('load.disk', null);
        const mimeType = this.state.get('load.type', null);

        try {
            this.state.set('load.loading', true);

            this.eventBus.emit(Events.FILES_REQUEST, {cursor, mime_type: mimeType, disk});

            const {files = [], meta = {}} = await this.request.getFiles({cursor, mime_type: mimeType, disk});

            this.state.set('load.hasMore', Boolean(meta.has_more));

            this.state.set('load.cursor', meta.next_cursor ?? null);

            this.appendFiles(files);

            this.eventBus.emit(Events.FILES_RECEIVE, {files, meta});

        } catch (error) {

            console.error(error);

            this.errorBus?.emit?.(error);

            this.eventBus.emit(
                Events.FILES_REQUEST_FAILED,
                error
            );

        } finally {

            this.state.set('load.loading', false);
        }
    }

    appendFiles(files = []) {

        const currentFiles = this.state.get('load.files', []);

        const updatedFiles = [...currentFiles, ...files];

        this.state.set('load.addedFiles', files);

        this.state.set('load.files', updatedFiles);

        console.debug(`[LoadService] Added: ${files.length}, Total: ${updatedFiles.length}`);
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
