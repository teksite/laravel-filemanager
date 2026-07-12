import Events from "../constants/events.js";
import BaseService from "../Foundation/BaseServices.js";


export default class SelectService extends BaseService {

    constructor(app, options = {}) {

        super(app, options);
    }

    busEvents() {
        return {
            [Events.SELECTION_CLICK]: ({fileId}) => {
                this.addToSelections(fileId);
            },

            [Events.SELECTION_REMOVE_SIGNAL]: ({fileId}) => {
                this.removeFromSelections(fileId);
            },

            [Events.FILE_DELETE_SIGNAL]: ({fileId}) => {
                this.removeFromSelections(fileId);
            },

            [Events.SELECTION_REMOVED]: ({fileId}) => {
                this.removeCurrentFile(fileId);
            }
        };
    }

    addToSelections(fileId) {

        if (!fileId) return;

        const files = this.state.get('load.files', {});

        const selectedFile = files[fileId];

        if (!selectedFile) return;


        const mode = this.options.mode ?? 'single';

        const selected = this.state.get('select.files', {});

        const next = {...selected};


        if (next[fileId]) {
            delete next[fileId];
        } else {
            next[fileId] = selectedFile;
        }

        if (['multi', 'multiple'].includes(mode)) {

            this.state.set('select.files', next);

            return;
        }

        this.state.set('select.files', {[selectedFile.id]: selectedFile});
    }


    removeFromSelections(fileId) {

        if (!fileId) return;

        const selections = this.state.get('select.files', {});

        if (!selections || !selections[fileId]) return;

        const next = {...selections};

        delete next[fileId];

        this.state.set('select.files', next);

        this.eventBus.emit(Events.SELECTION_REMOVED, {fileId});
    }


    removeCurrentFile(fileId) {
        const currentId = this.state.get('select.current', null);
        console.log(fileId)
        console.log(currentId)

        if (fileId === currentId) this.state.set('select.current', null);
    }


    returnSelections() {

        const files = this.state.get('select.files', {});

        const values = Object.values(files);

        if (values.length === 0) return null;

        const mode = this.options.mode ?? 'single';

        const expect = this.options.expect ?? 'url';


        const format = file => {

            switch (expect) {

                case 'id':
                    return file.id;

                case 'url':
                    return file.url;

                case 'file':
                case 'object':
                    return file;

                default:
                    return null;
            }
        };

        if (['multi', 'multiple'].includes(mode)) {

            return values.map(format);
        }

        return format(values[0]);
    }
}
