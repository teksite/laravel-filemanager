import FilePicker from "./FilePicker.js";


export default class StandaloneButton {

    constructor(id, {trigger, ...options}) {

        this.picker = new FilePicker(id, options);

        this.trigger = trigger;

        this.bind();
    }


    bind() {

        this.clickHandler = this.clickHandler.bind(this);

        document.addEventListener("click", this.clickHandler);
    }


    clickHandler(event) {

        const btnEl = event.target.closest(this.trigger);

        if (!btnEl) return;

        event.preventDefault();

        this.picker.open();
    }


    on(callback) {

        this.picker.on(callback);

        return this;
    }


    destroy() {

        document.removeEventListener("click", this.clickHandler);

        this.picker.destroy();
    }
}
