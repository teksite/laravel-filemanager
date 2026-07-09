import Events from "../constants/events.js";
import handler from "../helpers/handler.js";

export default class DeleteService {

    constructor({url, options = {}}, eventBus, state, requestService, errorService) {

        this.options = {
            endpoint: url ?? '/api/filemanager',
            ...options
        };

        this.state = state;

        this.eventBus = eventBus;

        this.errorBus = errorService;

        this.request = requestService;

        this.bindEventBus();
    }


    bindEventBus() {
        this.handleDeleteSignal = this.handleDeleteSignal.bind(this);

        this.eventBus.on(Events.FILE_DELETE_SIGNAL, this.handleDeleteSignal);
    }


    async handleDeleteSignal({fileId} = {}) {

        const id = fileId ?? this.state.get('select.current');
        if (!id) return;

        const {success} = await handler({
            resolve: () => {
               this.request.deleteFile(id);
            },


            reject: (error) => {
                this.errorBus?.emit(error);

                this.eventBus.emit(Events.FILE_DELETE_FAILED, {fileId});

                throw error;
            }
        });


        if (!success) return;

        this.removeFileFromState(id);

        this.state.set('select.current', null);

        this.eventBus.emit(Events.FILE_DELETED, {fileId: id});
    }


    removeFileFromState(fileId) {

        const files = this.state.get('load.files', {});

        if (!files[fileId]) return;

        const nextFiles = {...files};

        delete nextFiles[fileId];

        this.state.set('load.files', nextFiles);

    }


    destroy() {

        this.eventBus.off(Events.FILE_DELETE_SIGNAL, this.handleDeleteSignal);

    }
}
