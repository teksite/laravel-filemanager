import Events from "../constants/events.js";
import handler from "../helpers/handler.js";

export default class UpdateService {

    constructor({url, options = {}}, eventBus, state, requestService, errorService) {

        this.options = {
            endpoint: url ?? '/api/filemanager',
            ...options
        };

        this.state = state;

        this.eventBus = eventBus;

        this.request = requestService;

        this.errorBus = errorService;

        this.bindEvents();
    }


    bindEvents() {

        this.updateTitle = this.updateTitle.bind(this);

        this.eventBus.on(Events.FILE_UPDATE_TITLE_SIGNAL, this.updateTitle);
    }


    async updateTitle({fileId, title , oldTitle} = {}) {

        if (!fileId || !title) return;

        const {success, data} = await handler({

            resolve: async () => {

                const data = await this.request.patch(`${this.options.endpoint}/${encodeURIComponent(fileId)}`, {title});

                const file = await data?.file

                this.updateState(fileId, file);

                return {file, fileId, title , oldTitle}

            },

            reject: (error) => {

                this.errorBus?.emit?.(error);

                this.eventBus.emit(Events.FILE_UPDATE_TITLE_FAILED, {fileId, title , oldTitle});

                throw error;
            }

        });

        if (success) {
            const {fileId, file, title , oldTitle} = data;
            this.eventBus.emit(Events.FILE_UPDATED_TITLE, {fileId, file, title ,oldTitle});
        }

        return success;
    }


    updateState(fileId, file = {}) {

        const files = this.state.get('load.files', {});

        if (!files[fileId]) return;
        const next = {
            ...files,
            [fileId]: {...files[fileId], ...file}
        }

        this.state.set('load.files', next);
    }


    destroy() {

        this.eventBus.off(Events.FILE_UPDATE_TITLE_SIGNAL, this.updateTitle);
    }
}
