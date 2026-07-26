import UiService from "../Foundation/UiService.js";
import EVENTS from "../constants/events.js";

export default class SelectionButtonUi extends UiService {

    defineElements() {
        return {
            actionsEl: this.options?.actionsEl ?? "[data-actions-sec]",
        };
    }


    shouldInitialize() {

        return Boolean(this.options.config.expect && this.actionsEl);
    }


    initialize() {

        this.createButton();
    }


    domEvents() {

        return [
            [
                this.chooseBtn, "click", this.handleChoose
            ]
        ];

    }

    createButton() {

        const handleChoose = (event) => {

            event.preventDefault();

            event.stopPropagation();

            const files = this.state.get("select.files");

            this.emit(EVENTS.SELECTION_ON_CHOOSE, {files});

            this.state.set("select.files", null);

            this.state.set("select.current", null);
        }


        this.chooseBtn = this.actionsEl.querySelector("[data-choose-button]");

        if (this.chooseBtn) return;

        this.chooseBtn = document.createElement("button");

        this.chooseBtn.className = "choose-btn";

        this.chooseBtn.dataset.chooseButton = "";

        this.chooseBtn.type = "button";

        this.chooseBtn.title = "Choose selected file(s)";

        this.chooseBtn.textContent = "Choose";

        this.chooseBtn.onclick = handleChoose;

        this.actionsEl.prepend(this.chooseBtn);

        this.emit(EVENTS.SELECTION_SELECT_BUTTON_MADE, {button: this.chooseBtn});
    }

    handleChoose() {

        const files = this.state.get("select.files");

        this.emit(EVENTS.SELECTION_ON_CHOOSE, {files});

        this.state.set("select.files", null);

        this.state.set("select.current", null);
    }

}
