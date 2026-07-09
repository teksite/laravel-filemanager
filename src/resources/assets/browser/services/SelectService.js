import Events from "../constants/events.js";

export default class SelectService {

    constructor(options = {}, eventBus, state) {

        this.options = {...options};

        this.state = state;

        this.eventBus = eventBus;

        this.listeners = {};

        this.bindEvents();
    }


    bindEvents() {

        this.removeFromSelections = this.removeFromSelections.bind(this);

        this.addToSelections = this.addToSelections.bind(this);

        this.listeners = {
            addToSelections: ({fileId}) => {
                this.addToSelections(fileId)
            },
            removeFromSelections: ({fileId}) => {
                this.removeFromSelections(fileId)
            }
        };


        this.eventBus.on(Events.SELECTION_CLICK, this.listeners.addToSelections);

        this.eventBus.on(Events.SELECTION_REMOVE_SIGNAL, this.listeners.removeFromSelections);

        this.eventBus.on(Events.FILE_DELETE_SIGNAL, this.listeners.removeFromSelections);
    }


    addToSelections(fileId) {
        const {mode} = this.options;

        const files = this.state.get('load.files', {});

        const selectedFile = files[fileId];

        if (!selectedFile) return;

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
        const selections = this.state.get('select.files');

        if (!selections) return;

        const next = {...selections};

        delete next[fileId];

        this.state.set('select.files', Object.keys(next).length ? next : {});

        this.eventBus.emit(Events.SELECTION_REMOVED , {fileId})



    }

    returnSelections() {
        const files = this.state.get('select.files', {});
        const {mode = 'single', expect = 'url'} = this.options;

        const format = (file) => {
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
        const values = Object.values(files);


        if (['multi', 'multiple'].includes(mode)) {
            return values.map(format);
        }

        return values.length ? format(values[0]) : null;

    }


    destroy() {

        this.eventBus.off(Events.SELECTION_CLICK, this.listeners.addToSelections);

        this.eventBus.off(Events.SELECTION_REMOVE_SIGNAL, this.listeners.removeFromSelections);

        this.eventBus.off(Events.FILE_DELETE_SIGNAL, this.listeners.removeFromSelections);

    }
}
