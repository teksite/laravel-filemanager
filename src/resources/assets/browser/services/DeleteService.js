import events from "../constants/events.js";
import handler from "../helpers/handler.js";

export default class DeleteService {

    constructor({url, options = {}}, eventBus, state, requestService, errorService) {

        this.options = {
            endpoint: url ?? '/api/filemanager',
            ...options
        };

        this.eventBus = eventBus;
        this.state = state;
        this.errorService = errorService;
        this.request = requestService;

        this.bindEventBus();
    }


    bindEventBus() {
        this.handleDeleteSignal = this.handleDeleteSignal.bind(this);

        this.eventBus.on(
            events.FILE_DELETE_SIGNAL,
            this.handleDeleteSignal
        );
    }


    async handleDeleteSignal({fileId} = {}) {

        const id = fileId ?? this.state.get('select.current');
        if (!id) return;

        const {success, error} = await handler({
            resolve: () => this.request.deleteFile(id),

            reject: (error) => {
                this.errorService?.emit(error);
                throw error;
            }
        });


        if (!success) {
            return;
        }


        this.removeFileFromState(id);

        this.state.set('select.current', null);


        this.eventBus.emit(events.FILE_DELETED, {
            fileId: id
        });
    }


    removeFileFromState(fileId) {

        const files = this.state.get('load.files', {});

        if (!files[fileId]) return;


        const remainingFiles = {...files};

        delete remainingFiles[fileId];


        this.state.set(
            'load.files',
            remainingFiles
        );
    }


    destroy() {

        this.eventBus.off(
            events.FILE_DELETE_SIGNAL,
            this.handleDeleteSignal
        );

    }
}
