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
        this.errorBus = errorService;


        this.sendRequest = this.sendRequest.bind(this);


        this.bindEvents();


        if (this.options.getOnInit) {
            this.sendRequest();
        }
    }


    bindEvents() {

        this.eventBus.on(
            Events.FILES_NEED_MORE,
            this.sendRequest
        );
    }


    async sendRequest() {

        if (this.state.get("load.loading")) {
            return;
        }


        const hasMore = this.state.get(
            "load.hasMore",
            true
        );


        const cursor = this.state.get(
            "load.cursor",
            null
        );


        if (!hasMore && cursor !== null) {
            return;
        }


        const disk = this.state.get(
            "load.disk",
            null
        );


        const mimeType = this.state.get(
            "load.type",
            null
        );


        await handler({

            resolve: async () => {

                this.state.set(
                    "load.loading",
                    true
                );


                this.eventBus.emit(
                    Events.FILES_REQUEST,
                    {
                        cursor,
                        disk,
                        mime_type: mimeType
                    }
                );


                const response =
                    await this.request.getFiles({
                        cursor,
                        disk,
                        mime_type: mimeType
                    });


                const {
                    files = [],
                    meta = {}
                } = response;


                this.state.set(
                    "load.hasMore",
                    Boolean(meta.has_more)
                );


                this.state.set(
                    "load.cursor",
                    meta.next_cursor ?? null
                );


                this.appendFiles(files);


                this.eventBus.emit(
                    Events.FILES_RECEIVE,
                    {
                        files,
                        meta
                    }
                );
            },


            reject: async (error) => {

                this.errorBus?.emit?.(error);


                this.eventBus.emit(
                    Events.FILES_REQUEST_FAILED,
                    error
                );
            },


            final: () => {

                this.state.set(
                    "load.loading",
                    false
                );
            }

        });
    }


    appendFiles(files = []) {

        const normalizedFiles = Array.isArray(files)
            ? Object.fromEntries(
                files.map(file => [file.id, file])
            )
            : files;


        const currentFiles = this.state.get(
            "load.files",
            {}
        );


        const updatedFiles = {
            ...currentFiles,
            ...normalizedFiles
        };


        this.state.set(
            "load.files",
            updatedFiles
        );


        this.state.set(
            "load.addedFiles",
            normalizedFiles
        );
    }


    reset(files = []) {

        const normalizedFiles = Array.isArray(files)
            ? Object.fromEntries(
                files.map(file => [file.id, file])
            )
            : files;


        this.state.set(
            'load.cursor',
            null
        );


        this.state.set(
            'load.hasMore',
            true
        );


        this.state.set(
            'load.files',
            normalizedFiles
        );


        this.state.set(
            'load.addedFiles',
            normalizedFiles
        );
    }


    stop() {

        this.eventBus.off(
            Events.FILES_NEED_MORE,
            this.sendRequest
        );
    }


    destroy() {

        this.stop();
    }
}
