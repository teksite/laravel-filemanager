import {$} from "../helpers/dom.js";
import events from "../constants/events.js";
import {renderMedia} from "../helpers/preview.js";

export default class SelectionButtonUi {

    constructor({elements = {}} = {}, options = {}, eventBus, stateManager) {

        this.option = {...options}

        this.loadElements(elements);

        if (!this.option.mode) return


        this.listeners = {};

        this.eventBus = eventBus;
        this.state = stateManager;

        this.createButtons();
        this.bindUiEvents();


    }


    loadElements(elements) {

        const actionsSelector = elements.actionsEl ?? '[data-actions-sec]';
        const gridSelector = elements.gridEl ?? '[data-selected-list]';


        this.actionsEl = $(actionsSelector);
        this.gridEl = $(gridSelector);
        this.chooseBtn = null;
    }

    createButtons() {

        if (!this.actionsEl) return;

        const selectionBtn = document.createElement('button');

        selectionBtn.className = 'choose-btn';

        selectionBtn.dataset.chooseButton = '';

        selectionBtn.role = 'button';

        selectionBtn.type = 'button';

        selectionBtn.title = 'have file(s)';

        selectionBtn.innerText = 'Choose';

        this.actionsEl.prepend(selectionBtn);

        this.chooseBtn = selectionBtn;

        this.eventBus.emit(events.SELECTION_SELECT_BUTTON_MADE, {button: selectionBtn});


    }


    bindUiEvents() {

        this.emitReturnFiles = this.emitReturnFiles.bind(this);

        this.chooseBtn?.addEventListener('click', this.emitReturnFiles);


    }

    emitReturnFiles(e) {
        e.preventDefault();
        e.stopPropagation();

        const files = this.state.get('select.file');

        this.eventBus.emit(events.SELECTION_ON_CHOOSE, {files});
        this.state.set('select.file' , null);

    }


    destroy() {
        this.chooseBtn?.removeEventListener('click', this.emitReturnFiles);
    }

}
