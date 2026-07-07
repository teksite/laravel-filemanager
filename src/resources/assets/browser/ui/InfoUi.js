import {$, escapeHtml} from "../helpers/dom.js";
import {getMimeGroup, getMimeIcon} from "../helpers/mime.js";
import events from "../constants/events.js";
import formatSize from "../helpers/formatSize.js";

export default class InfoUi {

    constructor({elements = {}} = {}, options = {}, eventBus, stateManager) {

        this.loadElements(elements);
        this.option = {...options}
        this.current = null;

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

        this.deleteBtnEl = $(elements.deleteBtnEl ?? '[data-delete]');
        this.copyBtnEl = $(elements.copyBtnEl ?? '[data-open]');
        this.openBtnEl = $(elements.openBtnEl ?? '[data-copy]');
    }

    bindBusEvents() {
        this.listeners = {
            showInfo: ({value}) => {
                this.showInfo(value)
            },
            activeButtons: ({value}) => {
                this.activeButtons(value)
            },
        };
        this.eventBus.on('select.current', this.listeners.showInfo);
        this.eventBus.on('select.current', this.listeners.activeButtons);


    }

    bindUiEvents() {
        this.copyHandler = this.copyUrl.bind(this);
        this.openHandler = this.openFile.bind(this);


        this.copyBtnEl?.addEventListener('click', this.copyHandler);
        this.openBtnEl?.addEventListener('click', this.openHandler);
    }

    showInfo(fileId) {
        const files = this.state.get('load.files', {});
        const file = files[fileId];
        if (!file) return;

        this.current = file;

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
                box.innerHTML = `<img src="${item.url}" alt="${item.title}" />`;
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

    activeButtons() {
        this.deleteBtnEl.disabled = false;
        this.copyBtnEl.disabled = false;
        this.openBtnEl.disabled = false;
    }


    async copyUrl() {

        if (!this.current?.url) return;

        try {
            await navigator.clipboard.writeText(this.current.url);
            console.log('URL copied');
        } catch (e) {
            console.error(e);
        }
    }


    openFile() {

        if (!this.current?.url) return;

        window.open(this.current.url, '_blank', 'noopener,noreferrer');
    }



    destroy() {

        this.copyBtnEl?.removeEventListener('click', this.copyHandler);
        this.openBtnEl?.removeEventListener('click', this.openHandler);


        this.eventBus.off('select.current', this.listeners.showInfo);
        this.eventBus.off('select.current', this.listeners.activeButtons);


        this.eventBus.off(events.UPLOAD_SUCCESS, this.listeners.prepend);


    }

}
