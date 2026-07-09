import {$} from "../helpers/dom.js";
import EVENTS from "../constants/events.js";


export default class SelectionButtonUi {

    constructor({elements = {}} = {}, options = {}, eventBus, stateManager) {

        this.options = {...options}

        this.loadElements(elements);

        if (!this.options.expect) return

        this.listeners = {};

        this.state = stateManager;

        this.eventBus = eventBus;

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

        selectionBtn.title = 'Choose selected file(s)';

        selectionBtn.textContent = 'Choose';

        this.actionsEl.prepend(selectionBtn);

        this.chooseBtn = selectionBtn;

        this.eventBus.emit(EVENTS.SELECTION_SELECT_BUTTON_MADE, {button: selectionBtn});


    }


    bindUiEvents() {

        this.emitReturnFiles = this.emitReturnFiles.bind(this);

        this.chooseBtn?.addEventListener('click', this.emitReturnFiles);

    }

    emitReturnFiles(e) {

        e.preventDefault();

        e.stopPropagation();

        const files = this.state.get('select.files');

        this.eventBus.emit(EVENTS.SELECTION_ON_CHOOSE, {files});

        this.state.set('select.files' , null);

        this.state.set('select.current', null);

    }


    destroy() {

        this.chooseBtn?.removeEventListener('click', this.emitReturnFiles);
    }

}
