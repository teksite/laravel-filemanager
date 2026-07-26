import Events from "../constants/events.js";
import BaseServices from "../Foundation/BaseServices.js";
import handler from "../helpers/handler.js";

export default class DeleteService extends BaseServices {

    constructor(app, options = {}) {

        super(app, options);

        this.options = {
            endpoint: "/api/filemanager",
            ...options
        };

        this.deletingId = null;
    }

    busEvents() {

        return {

            [Events.FILE_DELETE_SIGNAL]: this.handleDeleteSignal,

        };
    }

    async handleDeleteSignal({fileId} = {}) {

        const id = fileId ?? this.state.get("select.current");

        if (!id) return;

        if (this.deletingId === id) return;

        this.deletingId = id;

        const {success} = await this.safe(
            () => {

                return this.request.deleteFile(encodeURIComponent(id));
            },

            (error) => {

                this.errorBus?.emit?.(error);

                this.emit(Events.FILE_DELETE_FAILED, {fileId: id});

                throw error;
            },

            () => {

                this.deletingId = null;
            }
        );

        if (!success) return;

        this.removeFileFromState(id);

        this.state.set("select.current", null);

        this.emit(Events.FILE_DELETED, {fileId: id});
    }


    removeFileFromState(fileId) {

        const files = this.state.get("load.files", {});

        if (!files[fileId]) return;

        const next = {...files};

        delete next[fileId];

        this.state.set("load.files", next);
    }
}
