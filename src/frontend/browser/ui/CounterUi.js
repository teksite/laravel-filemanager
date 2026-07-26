import UiService from "../Foundation/UiService.js";

export default class CounterUi extends UiService {

    defineElements() {

        return {

            counterEl: this.options.elements?.counterEl ?? "[data-file-counter]",
        };
    }

    busEvents() {

        return {

            "load.files": this.updateCounter,
        };
    }

    shouldInitialize() {

        return Boolean(this.counterEl);
    }

    initialize() {

        this.updateCounter();
    }

    updateCounter() {

        const files = this.state.get("load.files", {});

        this.counterEl.textContent = Object.keys(files).length;
    }
}
