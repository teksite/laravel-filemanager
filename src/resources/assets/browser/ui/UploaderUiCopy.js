import {$, escapeHtml} from "../helpers/dom.js";
import Events from "../constants/events.js";
import formatSize from "../helpers/formatSize.js";
import {getMimeIcon} from "../helpers/mime.js";
import {uniqueString} from "../helpers/general.js";

export default class UploaderUiCopy {

    constructor({uploadPreviewSelector = null} = {}, eventBus, stateManager) {

        this.files = [];
        this.eventBus = eventBus;
        this.state = stateManager;

        this.listeners = [];

        const selector = uploadPreviewSelector ?? '[data-upload-preview]';

        this.uploadPreviewEl = $(selector);

        this.bindDomEvents();

        this.bindBusEvents();

        this.render();
    }

    bindBusEvents() {


        this.listeners = {

            selected: ({files}) => {
                this.files = files;
                this.render();
            },

            progress: ({file, percent}) => {
                this.updatePreview(file, percent);
            },

            success: ({file}) => {
                this.finishPreview(file, true);
            },

            failed: ({file}) => {
                this.finishPreview(file, false);
            },

            complete: ({success, failed}) => {
                this.competeUpload(success, failed);
            }

        };

        this.eventBus.on(Events.UPLOAD_SELECTED, this.listeners.selected);

        this.eventBus.on(Events.UPLOAD_PROGRESS, this.listeners.progress);

        this.eventBus.on(Events.UPLOAD_SUCCESS, this.listeners.success);

        this.eventBus.on(Events.UPLOAD_FAILED, this.listeners.failed);

        this.eventBus.on(Events.UPLOAD_COMPLETE, this.listeners.complete);

    }

    render() {
        this.uploadPreviewEl.innerHTML = this.renderList(this.files);
    }

    renderList(files) {

        if (!files.length) return '';

        return files
            .map(file => this.renderPreviewItem(file))
            .join('');

    }

    renderPreviewItem(file) {

        const id = this.fileId(file);
        const fileName = escapeHtml(file.name);
        return `
            <div class="upload-item" data-file="${id}">
                <div>
                    ${getMimeIcon(file.type)}
                    ${fileName}
                    <div class="upload-progress">
                        <div class="progress-bar" data-progress="${id}"></div>
                    </div>
                    <small data-status="${id}" class="upload-status"></small>
                </div>
                <div>
                    <small>${formatSize(file.size ?? 0)}</small>
                    <button type="button" data-remove="${id}">x</button>
                </div>
            </div>
        `;
    }

    bindDomEvents() {

        this.uploadPreviewEl.addEventListener('click', e => {
                const btn = e.target.closest('[data-remove]');
                if (!btn) return;
                this.remove(btn.dataset.remove);
            }
        );
    }

    remove(id) {

        const item = this.uploadPreviewEl.querySelector(`[data-file="${id}"]`);

        item?.remove();

        this.files = this.files.filter(file => this.fileId(file) !== id);

        this.state.set('upload.files', this.files);

    }

    fileId(file) {
        if (!file.__uploadId) {
            Object.defineProperty(
                file,
                '__uploadId',
                {
                    value: uniqueString(),
                    writable: false
                }
            );
        }
        return file.__uploadId;
    }

    updatePreview(file, percent) {

        const id = this.fileId(file);

        const progressEl = this.uploadPreviewEl.querySelector(`[data-progress="${id}"]`);

        if (!progressEl) return;

        progressEl.style.width = `${percent}%`;

        progressEl.textContent = `${percent}%`;

    }

    finishPreview(file, success = true) {

        const id = this.fileId(file);

        const progressEl = this.uploadPreviewEl.querySelector(`[data-progress="${id}"]`);

        const statusEl = this.uploadPreviewEl.querySelector(`[data-status="${id}"]`);

        const item = this.uploadPreviewEl.querySelector(`[data-file="${id}"]`);

        if (!progressEl || !item) return;

        progressEl.style.width = '100%';

        if (success) {

            progressEl.classList.add('success');

            statusEl.textContent = 'Uploaded';

        } else {

            progressEl.classList.add('failed');

            statusEl.textContent = 'Failed';
        }


        setTimeout(() => {
            item.style.opacity = '0';
            setTimeout(() => item.remove(), 300);
        }, 5000);
    }

    competeUpload(success, failed) {

        const old = this.uploadPreviewEl.querySelector('.upload-summary');
        old?.remove();
        const summary = document.createElement('div');

        summary.className = 'upload-summary';

        summary.innerHTML = `Upload complete<br>Success: ${success}<br>Failed: ${failed}`;

        this.uploadPreviewEl.prepend(summary);

    }


    destroy() {

        this.eventBus.off(Events.UPLOAD_SELECTED, this.listeners.selected);

        this.eventBus.off(Events.UPLOAD_PROGRESS, this.listeners.progress);

        this.eventBus.off(Events.UPLOAD_SUCCESS, this.listeners.success);

        this.eventBus.off(Events.UPLOAD_FAILED, this.listeners.failed);

        this.eventBus.off(Events.UPLOAD_COMPLETE, this.listeners.complete);

    }

}
