import {$, escapeHtml} from "../helpers/dom.js";
import {getMimeGroup, getMimeIcon} from "../helpers/mime.js";
import events from "../constants/events.js";

export default class InfoUi {

    constructor({elements = {}} = {}, options = {}, eventBus, stateManager) {

        this.loadElements(elements);
        this.option = {...options}


        this.listeners = [];

        this.eventBus = eventBus;
        this.state = stateManager;

        this.loadPreview = this.loadPreview.bind(this);

        this.bindBusEvents();
        this.bindUiEvents();
    }

    loadElements(elements) {
        this.baseInfoEl = $(elements.baseInfoEl ?? '[data-aside]');
        this.filePreviewEl = $(elements.filePreviewEl ?? '[data-preview]');
        this.idInfoEl = $(elements.idInfoEl ?? '[data-id]');
        this.titleInfoEl = $(elements.titleInfoEl ?? '[data-title]');
        this.urlInfoEl = $(elements.urlInfoEl ?? '[data-url]');
        this.sizeInfoEl = $(elements.sizeInfoEl ?? '[data-size]');
        this.mimeInfoEl = $(elements.mimeInfoEl ?? '[data-mime]');
        this.diskInfoEl = $(elements.diskInfoEl ?? '[data-disk]');
        this.createdInfoEl = $(elements.createdInfoEl ?? '[data-created]');

        this.deleteBtnEl = $(elements.deleteBtnEl ?? '[data-created]');

        this.copyBtnEl = $(elements.copyBtnEl ?? '[data-open]');
        this.openBtnEl = $(elements.openBtnEl ?? '[data-copy]');
    }

    bindBusEvents() {
        this.listeners = {
            append: ({value}) => {
                this.appendFile({value})
            },
            prepend: ({file: value}) => {
                this.prependFile(value)

            },
            toggleLoading: ({value}) => {
                this.toggleLoading(value)

            }
        };
        this.eventBus.on('load.addedFiles', this.listeners.append);
        this.eventBus.on('load.loading', this.listeners.toggleLoading);
        this.eventBus.on(events.UPLOAD_SUCCESS, this.listeners.prepend);

    }

    bindUiEvents() {
        this.gridEl.addEventListener('click', this.loadPreview);
    }




    destroy() {
        this.eventBus.off('load.addedFiles', this.listeners.append);

        this.eventBus.off('load.loading', this.listeners.toggleLoading);

        this.eventBus.off(events.UPLOAD_SUCCESS, this.listeners.prepend);


    }

}
