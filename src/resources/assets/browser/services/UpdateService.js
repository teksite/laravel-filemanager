import Events from "../constants/events.js";
import handler from "../helpers/handler.js";

export default class UpdateService {

    constructor({url, options = {}}, eventBus, state, requestService, errorService) {

        this.options = {
            endpoint: url ?? '/api/filemanager',
            ...options
        };


        this.eventBus = eventBus;
        this.state = state;
        this.request = requestService;
        this.errorBus = errorService;


        this.bindEvents();
    }


    bindEvents() {

        this.updateTitle = this.updateTitle.bind(this);

        this.eventBus.on(
            Events.FILE_UPDATE_TITLE,
            this.updateTitle
        );
    }


    async updateTitle({fileId, title} = {}) {

        if (!fileId || title == null) {
            return;
        }

        const {success} = await handler({

            resolve: async () => {

                const file = await this.request.patch(
                    `${this.options.endpoint}/${fileId}`,
                    {
                        title
                    }
                );

                this.updateState(fileId, file ?? { title });

                this.eventBus.emit(
                    Events.FILE_UPDATED_TITLE,
                    {
                        fileId,
                        file
                    }
                );
            },

            reject: async (error) => {

                this.errorBus?.emit?.(error);

                throw error;
            }

        });

        return success;
    }


    updateState(fileId, file = {}) {

        const files = this.state.get(
            'load.files',
            {}
        );

        if (!files[fileId]) {
            return;
        }

        this.state.set(
            'load.files',
            {
                ...files,
                [fileId]: {
                    ...files[fileId],
                    ...file
                }
            }
        );
    }



    destroy() {

        this.eventBus.off(
            Events.FILE_UPDATE_TITLE,
            this.updateTitle
        );
    }
}
