import {$, escapeHtml} from "../helpers/dom.js";
import {getMimeGroup, getMimeIcon} from "../helpers/mime.js";
import events from "../constants/events.js";
import formatSize from "../helpers/formatSize.js";

export default class InfoUi {

    constructor({elements = {}} = {}, options = {}, eventBus, stateManager) {

        this.loadElements(elements);
        this.option = {...options}


        this.listeners = [];

        this.eventBus = eventBus;
        this.state = stateManager;

        // this.loadPreview = this.loadPreview.bind(this);

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
            showInfo: ({value}) => {
                this.showInfo(value)
            },
        };
        this.eventBus.on('select.current', this.listeners.showInfo);
    }

    bindUiEvents() {
        // this.gridEl.addEventListener('click', this.loadPreview);
    }

    showInfo(fileId) {
        const files = this.state.get('load.files', {});
        const file = files[fileId];
        if (!file) return;

        this.idInfoEl.innerText = file?.id ?? '-';
        this.titleInfoEl.innerText = file?.title ?? '-';
        this.urlInfoEl.innerText = file?.url ?? '-';
        this.sizeInfoEl.innerText = (formatSize(file?.size ?? 0)) ?? '-';
        this.mimeInfoEl.innerText = file?.mime_type ?? '-';
        this.diskInfoEl.innerText = file?.disk ?? '-';
        this.createdInfoEl.innerText = file?.created_at ?? '-';

        this.renderPreview(file)

    }

    renderPreview(item) {

        const box = this.filePreviewEl;
        if (!box) return;

        const type = getMimeGroup(item.mime_type);
        switch (type) {

            case 'image':
                box.innerHTML = `<img src="${item.url}" />`;
                break;

            case 'video':
                box.innerHTML = `<video controls src="${item.url}"></video>`;
                break;

            case 'audio':
                box.innerHTML = `<audio controls src="${item.url}"></audio>`;
                break;

            default:
                box.innerHTML = `<div class="file-placeholder">${getMimeIcon(type)}</div>`;
        }
    }

    destroy() {
        this.eventBus.off('select.current', this.listeners.showInfo);


        this.eventBus.off(events.UPLOAD_SUCCESS, this.listeners.prepend);


    }

}
