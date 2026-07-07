import events from "../constants/events.js";
import handler from "../helpers/handler.js";

export default class DeleteService {

    constructor({url, options = {}}, eventBus, state, requestService, errorService) {

        this.options = {
            endpoint: url ?? '/api/filemanager',
            ...options
        };

        this.handlers = [];

        this.eventBus = eventBus;
        this.state = state;
        this.errorService = errorService;
        this.request = requestService;

        this._abort = false;
        this.bindEventBus()


    }

    bindEventBus() {
        this.sendDeleteRequest = this.sendDeleteRequest.bind(this);
        this.eventBus.on(events.FILE_DELETE_SIGNAL, this.sendDeleteRequest)

    }

    async sendDeleteRequest({fileId} = {}) {


        fileId = fileId ?? this.state.get('select.current');

        const {success, data, error} = await handler({
            resolve: () => this.request.deleteFile(fileId)

        });
       if (success){
           this.state.set('select.current', null);
           this.eventBus.emit(events.FILE_DELETED, { fileId });

           const files = this.state.get('load.files', {});

           const updatedFiles = { ...files };

           delete updatedFiles[fileId];

           this.state.set('load.files', updatedFiles);

       }
    }


    stop() {


    }

    destroy() {

        this.stop();
        this.eventBus.off(events.FILE_DELETE_SIGNAL, this.sendDeleteRequest)


    }
}
