import initFileManager from "../browser.js";
import * as Events from "node:events";

export default class FilePicker {


    constructor(id, {endpoint = "/api/filemanager/browser", config = {}, modal = {}} = {}) {

        this.endpoint = endpoint;

        this.id = id;

        this.config = this.normalizeConfig(config);

        this.modalConfig = {

            overlayClass: "filemanager overlay",

            dialogClass: "filemanager dialog",

            ...modal

        };


        this.overlay = null;

        this.dialog = null;


        this.fileManager = null;


        this.controller = null;


        this.listeners = new Set();


        this.opened = false;

    }


    normalizeConfig(config) {

        return { selection:{
                expect : 'object',
                mode:'single'
            }, ...config};
    }


    on(callback) {

        if (typeof callback === "function") this.listeners.add(callback);
        return this;
    }

    off(callback) {

        this.listeners.delete(callback);

        return this;
    }


    emit(files) {

        this.listeners.forEach(callback => callback(files));
    }


    async open() {

        if (this.opened) return;

        this.opened = true;

        this.createModal();

        this.showLoading();

        try {

            this.dialog.innerHTML = await this.loadView();

            const root = this.dialog.querySelector("[data-database-filemanager]");
            console.log(this.config)
            this.fileManager = initFileManager({config: this.config}, root);

            this.fileManager.once(Events.CHOOSE,

                files => {

                    this.emit(files);

                    this.close();
                }
            );

        } catch (error) {

            console.error(error);

            this.showError(error.message);
        }
    }


    close() {

        this.controller?.abort();

        this.controller = null;

        this.fileManager?.destroy();

        this.fileManager = null;

        this.overlay?.remove();

        this.overlay = null;

        this.dialog = null;

        this.opened = false;
    }


    createModal() {

        this.overlay = document.createElement("div");

        this.overlay.className = this.modalConfig.overlayClass;

        this.dialog = document.createElement("div");

        this.dialog.className = this.modalConfig.dialogClass;

        this.overlay.appendChild(this.dialog);

        this.overlay.addEventListener("click", () => this.close());

        this.dialog.addEventListener("click", event => event.stopPropagation());

        document.body.appendChild(this.overlay);
    }


    async loadView() {

        this.controller = new AbortController();


        const response = await fetch(this.endpoint, {

                method: "POST",

                signal: this.controller.signal,

                headers: {

                    "Content-Type": "application/json",

                    "X-Requested-With": "XMLHttpRequest"
                },

                body: JSON.stringify({config: this.config, id: this.id})
            }
        );


        if (!response.ok) {

            throw new Error(`FileManager error ${response.status}`);
        }

        return response.text();
    }


    showLoading() {

        this.dialog.innerHTML = `<div class="fm-loading">Loading...</div>`;
    }


    showError(message) {

        this.dialog.innerHTML = `<div class="fm-error">${message}</div>`;
    }


    destroy() {

        this.close();

        this.listeners.clear();
    }
}
