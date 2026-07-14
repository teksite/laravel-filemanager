import template from "./template.js";

export default class Modal {

    constructor() {

        const wrapper = document.createElement("div");

        wrapper.innerHTML = template();

        this.modal = wrapper.firstElementChild;

        this.root =this.modal.querySelector("[data-fm-root]");

        document.body.append(this.modal);

        this.clickHandler =this.clickHandler.bind(this);

        this.escapeHandler =this.escapeHandler.bind(this);

        this.modal.addEventListener("click", this.clickHandler);

        document.addEventListener("keydown", this.escapeHandler);

    }

    open() {

        this.modal.classList.remove("is-hidden");

        document.body.classList.add("fm-lock");
    }

    close() {

        this.modal.classList.add("is-hidden");

        document.body.classList.remove("fm-lock");
    }

    clickHandler(event) {

        if (!event.target.closest("[data-fm-close]")) return;

        this.close();
    }

    escapeHandler(event) {

        if (event.key !== "Escape") return;

        this.close();
    }

    destroy() {

        this.modal.removeEventListener("click", this.clickHandler);

        document.removeEventListener("keydown", this.escapeHandler);

        this.modal.remove();
    }

}
