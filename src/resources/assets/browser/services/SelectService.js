import Events from "../constants/events.js";

export default class SelectService {

    constructor(options = {}, eventBus, state) {

        this.options = {...options};
        this.eventBus = eventBus;
        this.state = state;
        this.listeners = {};
        this.bindEvents();
    }


    bindEvents() {

        this.addToSelections = this.addToSelections.bind(this);

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
        this.eventBus.on(Events.SELECTION_REMOVE, this.listeners.removeFromSelections);


    }


    addToSelections(fileId) {
        const {mode} = this.options;
        const files = this.state.get('load.files', {});

        const selectedFile = files[fileId] ?? null;

        if (!selectedFile) return;

        if (['multi', 'multiple'].includes(mode)) {
            const preState = this.state.get('select.files', {});

            const newState = {...preState};

            if (newState[selectedFile.id]) {
                delete newState[selectedFile.id];
            } else {
                newState[selectedFile.id] = selectedFile;
            }

            this.state.set('select.files', newState);

            return;
        }

        this.state.set('select.files', selectedFile);

    }

    removeFromSelections(fileId) {
        const selections = this.state.get('select.files');

        if (!selections) return;

        if ('id' in selections) {
            if (selections.id === fileId) {
                this.state.set('select.files', null);
            }
            return;
        }

        const newState = {...selections};
        delete newState[fileId];

        this.state.set(
            'select.files',
            Object.keys(newState).length ? newState : null
        );
    }

    returnSelections() {
        const files = this.state.get('select.files', {});
        const {mode = 'single', expect = 'url'} = this.options;

        const values = Object.values(files);
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

        if (['multi', 'multiple'].includes(mode)) {
            return values.map(format);
        }

        const file = values[0];

        if (!file) {
            return null;
        }

        return format(file);
    }


    destroy() {

        this.eventBus.off(Events.SELECTION_CLICK, this.listeners.addToSelections);

        this.eventBus.off(Events.SELECTION_REMOVE, this.listeners.removeFromSelections);
    }
}
