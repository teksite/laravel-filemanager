import UiService from "../Foundation/UiService.js";
import Events from "../constants/events.js";
import {renderMedia} from "../helpers/preview.js";

export default class SelectionGridUi extends UiService {

    defineElements() {

        return {

            gridEl: "[data-selected-list]",
        };
    }


    shouldInitialize() {

        return !!this.gridEl;
    }


    busEvents() {

        return {

            [Events.SELECTION_CLICK]: this.renderSelections,

            [Events.SELECTION_ON_CHOOSE]: this.clearGrid,

            [Events.SELECTION_REMOVED]: ({fileId}) => this.removeItem(fileId),
        };
    }


    domEvents() {

        return [
            [
                this.gridEl, "click", this.handleRemoveClick
            ]
        ];
    }


    renderSelections() {

        const files = this.state.get("select.files", {});

        this.clearGrid();

        const values = Object.values(files);

        if (!values.length) return;

        const fragment = document.createDocumentFragment();

        values.forEach(file => {

            const wrapper = document.createElement("div");

            wrapper.innerHTML = this.renderItem(file);

            fragment.appendChild(wrapper.firstElementChild);
        });

        this.gridEl.appendChild(fragment);
    }


    clearGrid() {

        this.gridEl.innerHTML = "";
    }


    renderItem(file) {

        return `
            <div class="selected-item" data-selected-item data-id="${file.id}">
                ${renderMedia(file)}
                <button class="selected-item-delete-btn" data-selected-remove data-id="${file.id}" type="button">
                    ✖
                </button>
            </div>
        `;
    }


    handleRemoveClick(event) {

        const button = event.target.closest("[data-selected-remove]");

        if (!button) return;

        this.emit(Events.SELECTION_REMOVE_SIGNAL, {fileId: button.dataset.id});
    }


    removeItem(fileId) {

        if (!fileId) return;

        this.gridEl.querySelector(`[data-selected-item][data-id="${CSS.escape(fileId)}"]`)?.remove();
    }

}
