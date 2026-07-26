import Events from "../constants/events.js";
import BaseService from "../Foundation/BaseServices.js";


export default class UpdateService extends BaseService {


    constructor(app, options = {}) {

        super(app, options);

        this.options = {endpoint: '/api/filemanager', ...options};
    }

    busEvents() {
        return {

            [Events.FILE_UPDATE_TITLE_SIGNAL]: this.updateTitle,
        };
    }


    async updateTitle({fileId, title, oldTitle} = {}) {

        if (!fileId || !title) return;

        const {success, data} =await this.safe(

            async () => {

                const response = await this.request.patch(`${this.options.endpoint}/${encodeURIComponent(fileId)}`, {title});

                const file = response?.file ?? {};

                this.updateState(fileId, file);

                console.log()
                return {file, fileId, title, oldTitle};
            },

            (error) => {

                this.errorBus?.emit?.(error);

                this.emit(Events.FILE_UPDATE_TITLE_FAILED, {fileId, title, oldTitle});

                throw error;
            }
        );

        if (!success) return false;

        this.emit(Events.FILE_UPDATED_TITLE, data);

        return true;
    }


    updateState(fileId, file = {}) {

        const files = this.state.get('load.files', {});

        if (!files[fileId]) return;

        this.state.set('load.files', {...files, [fileId]: {...files[fileId], ...file}});
    }

}
