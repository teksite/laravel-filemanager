import Events from "../constants/events.js";

export default class SelectService {

    constructor(options={},eventBus, state) {

        this.options = {...options};
        this.eventBus = eventBus;
        this.state = state;

        this.bindEvents();
    }


    bindEvents() {

        this.handleSelect = this.handleSelect.bind(this);

        this.eventBus.on(
            Events.FILE_SELECT,
            this.handleSelect
        );
    }


    handleSelect({fileId} = {}) {

        if (!fileId) {
            return;
        }


        this.state.set(
            'select.current',
            fileId
        );
    }


    clear() {

        this.state.set(
            'select.current',
            null
        );
    }


    destroy() {

        this.eventBus.off(
            Events.FILE_SELECT,
            this.handleSelect
        );
    }
}
