import {$} from "../helpers/dom.js";
import events from "../constants/events.js";
import formatSize from "../helpers/formatSize.js";
import {renderMedia} from "../helpers/preview.js";
import handler from "../helpers/handler.js";

export default class InfoUi {

    constructor({elements = {}} = {}, options = {}, eventBus, stateManager) {

        this.loadElements(elements);

        this.options = {...options};
        this.current = null;

        this.listeners = {};

        this.eventBus = eventBus;
        this.state = stateManager;

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
        this.copyBtnEl = $(elements.copyBtnEl ?? '[data-copy]');
        this.openBtnEl = $(elements.openBtnEl ?? '[data-open]');
    }


    bindBusEvents() {

        this.listeners = {

            revealInfo: ({value}) => {
                this.revealInfo(value);
            },

            activeButtons: ({value}) => {
                this.activeButtons(value);
            },

            fileDeleted: ({fileId}) => {
                this.handleDeletedFile(fileId);
            }

        };

        this.eventBus.on('select.current', this.listeners.revealInfo);

        this.eventBus.on('select.current', this.listeners.activeButtons);

        this.eventBus.on(events.FILE_DELETED, this.listeners.fileDeleted);
    }


    bindUiEvents() {

        this.copyHandler = this.copyUrl.bind(this);
        this.openHandler = this.openFile.bind(this);
        this.deleteHandler = this.emitDeleteRequest.bind(this);
        this.enableEditTitleMode = this.enableEditTitleMode.bind(this);


        this.copyBtnEl?.addEventListener('click', this.copyHandler);

        this.openBtnEl?.addEventListener('click', this.openHandler);

        this.deleteBtnEl?.addEventListener('click', this.deleteHandler);

        this.titleInfoEl?.addEventListener('dblclick', this.enableEditTitleMode);

    }


    revealInfo(fileId) {

        const files = this.state.get('load.files', {});

        const file = files[fileId];

        this.current = file ?? null;

        this.idInfoEl.innerText = file?.id ?? '-';
        this.titleInfoEl.innerText = file?.title ?? '-';
        this.urlInfoEl.innerText = file?.url ?? '-';
        this.sizeInfoEl.innerText = formatSize(file?.size ?? 0);
        this.mimeInfoEl.innerText = file?.mime_type ?? '-';
        this.diskInfoEl.innerText = file?.disk ?? '-';
        this.createdInfoEl.innerText = file?.created_at ?? '-';

        this.renderPreview(file);
    }

    renderPreview(item) {

        const box = this.filePreviewEl;

        if (!box) return;

        if (!item) {
            box.innerHTML = 'Select media';
            return;
        }
        box.innerHTML = renderMedia(item);

    }

    activeButtons(active = false) {

        const disabled = !active;
        this.deleteBtnEl && (this.deleteBtnEl.disabled = disabled);
        this.copyBtnEl && (this.copyBtnEl.disabled = disabled);
        this.openBtnEl && (this.openBtnEl.disabled = disabled);
    }


    handleDeletedFile(fileId) {

        if (this.current?.id !== fileId) return;

        this.current = null;

        this.renderPreview(null);

        this.activeButtons(false);
    }


    async copyUrl() {

        if (!this.current?.url) return;

        handler({
            resolve: async () => {
                await navigator.clipboard.writeText(this.current.url);
            },
            reject: (error) => {
                console.error(error);
                alert('SSL in not enabled or you are running on localhost')
            }
        });
    }


    openFile() {
        if (!this.current?.url) return;
        window.open(this.current.url, '_blank', 'noopener,noreferrer');
    }


    emitDeleteRequest() {

        if (!this.current?.id) return;

        this.eventBus.emit(events.FILE_DELETE_SIGNAL, {fileId: this.current.id});
    }


    enableEditTitleMode() {
        if (!this.current || this.editingTitle) return;

        this.editingTitle = true;

        this.renderTitleEditor();
    }

    renderTitleEditor() {

        const input = document.createElement('input');

        input.type = 'text';
        input.name = 'title';
        input.value = this.current.title ?? '';

        this.titleInfoEl.replaceChildren(input);

        input.focus();
        input.select();

        let submitted = false;

        const submit = () => {
            if (submitted) {
                return;
            }
            submitted = true;
            this.editingTitle = false;

            const oldTitle = this.current.title ?? '-';
            const newTitle = input.value.trim();

            if (oldTitle === newTitle) {
                this.renderTitle();
                return;
            }

            this.current.title = newTitle;
            this.renderTitle();

            this.eventBus.emit(events.FILE_UPDATE_TITLE, {fileId: this.current.id, title: newTitle});
        };

        input.addEventListener('keydown', e => {

            if (e.key === 'Enter') {
                e.preventDefault();
                submit();
            }

            if (e.key === 'Escape') {
                submitted = true;
                this.editingTitle = false;
                this.renderTitle();
            }

        });

        input.addEventListener('blur', submit);
    }

    renderTitle() {

        this.titleInfoEl.textContent = this.current?.title?.length
            ? this.current?.title
            : '-';
    }


    destroy() {

        this.copyBtnEl?.removeEventListener('click', this.copyHandler);

        this.openBtnEl?.removeEventListener('click', this.openHandler);

        this.deleteBtnEl?.removeEventListener('click', this.deleteHandler);

        this.titleInfoEl?.removeEventListener('dblclick', this.enableEditTitleMode);


        this.eventBus.off('select.current', this.listeners.revealInfo);

        this.eventBus.off('select.current', this.listeners.activeButtons);


        this.eventBus.off(events.FILE_DELETED, this.listeners.fileDeleted);
    }

}
