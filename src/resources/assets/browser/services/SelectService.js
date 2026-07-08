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
        const {mode, expect} = this.options;
        const files = this.state.get('load.files', {});

        const selectedFile = files[fileId] ?? null;

        if (!selectedFile) return;

        const expectedOutput = (expect === 'url')
            ? selectedFile.url
            : selectedFile.id;

        if (['multi' ,'multiple'].includes(mode)) {
            const preState = this.state.get('select.file', []);

            const newState = preState.includes(expectedOutput)
                ? preState.filter(item => item !== expectedOutput)
                : [...preState, expectedOutput];

            this.state.set('select.file', newState);

            return;
        }
        this.state.set('select.file', expectedOutput);

    }

    returnSelections(){
        return this.state.get('select.file', {});
    }



    destroy() {

        this.eventBus.off(Events.SELECTION_CLICK, this.addToSelections);
    }
}
