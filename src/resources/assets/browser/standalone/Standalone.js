import Modal from "./Modal.js";
import DatabaseFileManager from "../core/DatabaseFileManager.js";


export default class Standalone {

    constructor(options = {}) {

        this.options = {trigger: "[data-filemanager]", ...options};

        this.modal = new Modal();

        this.manager = new DatabaseFileManager({
            root: this.modal.root,
            ...options
        });

        console.log( this.modal.root)

        this.currentTrigger = null;

        this.clickHandler = this.clickHandler.bind(this);

        this.chooseHandler = this.chooseHandler.bind(this);

        document.addEventListener("click", this.clickHandler);

        this.manager.onChoose(this.chooseHandler);
    }

    clickHandler(event) {

        const trigger = event.target.closest(this.options.trigger);

        if (!trigger) return;

        event.preventDefault();

        this.currentTrigger = trigger;

        this.configure(trigger);

        this.modal.open();
    }

    configure(trigger) {

        const {mode, mime, disk, directory,} = trigger.dataset;

        this.manager.configure({mode, mime, disk, directory,});
    }

    chooseHandler(files) {

        this.options.onChoose?.(files, this.currentTrigger);

        this.modal.close();
    }

    destroy() {

        document.removeEventListener("click", this.clickHandler);

        this.manager.destroy();

        this.modal.destroy();
    }

}
