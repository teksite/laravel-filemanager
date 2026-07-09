import Events from "../constants/events.js";

export default class SelectService {

    constructor(options = {}, eventBus, state) {

        this.options = {...options};
        this.eventBus = eventBus;
        this.state = state;

        this.bindEvents();
    }


    bindEvents() {

        this.addToSelections = this.addToSelections.bind(this);
        this.eventBus.on(Events.SELECTION_CLICK, this.addToSelections);

    }


    addToSelections({fileId}) {
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

    returnSelections() {
        const files = this.state.get('select.files', {});
        const { mode = 'single', expect = 'url' } = this.options;

        const values = Object.values(files);
        const format = (file) => {
            switch (expect) {
                case 'id':
                    return file.id;

                case 'url':
                    return file.url;

                case 'file':
                case 'object':
                default:
                    return file;
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

        this.eventBus.off(Events.SELECTION_CLICK, this.addToSelections);
    }
}
