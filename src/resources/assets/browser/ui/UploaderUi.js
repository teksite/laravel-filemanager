import UiService from "../Foundation/UiService.js";
import Events from "../constants/events.js";
import {uniqueString} from "../helpers/general.js";
import {escapeHtml} from "../helpers/dom.js";
import formatSize from "../helpers/formatSize.js";
import {getMimeIcon} from "../helpers/mime.js";


export default class UploaderUi extends UiService {


    shouldInitialize() {

        return Boolean(this.formEl && this.dropzoneEl && this.inputEl);
    }

    initialize() {

        this.validFiles = {};

        this.invalidFiles = {};
    }


    defineElements() {

        return {

            messagesEl: this.config.get('ui.uploadMessagesSelector'),

            formEl: this.config.get('ui.uploadFormSelector'),

            dropzoneEl: this.config.get('ui.dropzoneSelector'),

            inputEl: this.config.get('ui.fileInputSelector'),
        };
    }


    busEvents() {

        return {

            [Events.UPLOAD_SUCCESS]: ({id, success, file}) => {
                this.updateUploadStatus(id, success, file);
            },

            [Events.UPLOAD_COMPLETE]: () => {
                this.finishUpload();
            },
        };
    }


    domEvents() {

        return [

            [this.dropzoneEl, 'click', this.openFileDialog],

            [this.dropzoneEl, 'dragover', this.preventDefault],

            [this.dropzoneEl, 'drop', this.dropFiles],

            [this.inputEl, 'change', this.changeFiles],

            [this.formEl, 'submit', this.submitUpload],

            [this.messagesEl, 'click', this.removeMessage],
        ];
    }


    openFileDialog() {

        this.inputEl.click();
    }


    dropFiles(event) {

        event.preventDefault();

        this.handleFiles(event.dataTransfer.files);
    }


    changeFiles(event) {

        this.handleFiles(event.target.files);

        event.target.value = '';
    }


    handleFiles(files = []) {

        const normalized = this.normalizeFiles(files);

        const mimeResult = this.validateByMimetype(normalized);

        const sizeResult = this.validateBySize(mimeResult.valid);

        this.validFiles = sizeResult.valid;

        this.invalidFiles = {...mimeResult.invalid, ...sizeResult.invalid};

        this.syncState();

        this.renderPreview();
    }

    normalizeFiles(files) {

        let items = {}

        Object.entries(files).forEach(([id, item,]) => {

            const fileId = `fake_${uniqueString()}`;

            item.id = fileId;

            return items[fileId] = item;
        });

        return items;
    }


    validateByMimetype(files = {}) {
        const allowed = this.config.get('upload.allowedMimes', [])
            .map(item => item.toLowerCase());

        if (!allowed.length) return {valid: files, invalid: {}};

        const valid = {};

        const invalid = {};

        Object.entries(files).forEach(([id, file]) => {

            const mime = (file.type || '').toLowerCase();

            if (allowed.includes(mime)) {

                valid[id] = file;
            } else {

                file.reason = 'invalid type';

                invalid[id] = file;
            }
        });

        return {valid, invalid};
    }


    validateBySize(files = {}) {

        const maxSize = this.config.get('upload.maxSize', null);

        if (!maxSize) {

            return {valid: files, invalid: {}};
        }

        const valid = {};

        const invalid = {};


        Object.entries(files).forEach(([id, file]) => {

            if (file.size <= maxSize) {

                valid[id] = file;
            } else {
                file.reason = `max size ${formatSize(maxSize)}`;

                invalid[id] = file;
            }
        });
        return {valid, invalid};
    }


    syncState() {

        this.state.set('upload.files', this.validFiles);
    }


    renderPreview() {

        if (!this.messagesEl) return;

        const invalid = Object.entries(this.invalidFiles)
            .map((item) => this.renderItem(item, false));

        const valid = Object.entries(this.validFiles)
            .map((item) => this.renderItem(item, true));

        this.messagesEl.innerHTML = [...invalid, ...valid].join('');
    }


    renderItem([id, file], valid) {

        return `
            <div class="upload-item ${valid ? 'valid-file' : 'invalid-file'}" data-upload-preview data-file-id="${file.id}">
                <div class="upload-file-info">
                     ${getMimeIcon(file.type)}
                     ${escapeHtml(file.name)}
                    <div class="info">
                        <div class="upload-progress"><div class="progress-bar" data-progress-bar="${file.id}"></div></div>
                    </div>
                </div>
                <div class="upload-file-action" data-upload-action-box="${file.id}">
                   <div>
                        <small>
                            ${formatSize(file.size)}
                        </small>
                        <small data-upload-status data-id="${file.id}">
                            ${valid ? 'ready to upload' : (file?.reason ? `${file.reason}` : "invalid file")}
                        </small>
                   </div>
                    <button type="button" data-remove-message="${file.id}">
                        ×
                    </button>
                </div>
            </div>`;
    }


    removeMessage(event) {

        const button = event.target.closest('[data-remove-message]');

        if (!button) return;

        const id = button.dataset.removeMessage;

        delete this.validFiles[id];

        delete this.invalidFiles[id];

        this.syncState();

        button.closest('[data-upload-preview]')?.remove();
    }


    updateUploadStatus(id, success, file) {

        const item = this.messagesEl?.querySelector(`[data-file-id="${CSS.escape(id)}"]`);

        if (!item) return;

        item.classList.toggle('valid-file', success);

        item.classList.toggle('invalid-file', !success);

        const bar = item.querySelector(`[data-progress-bar="${CSS.escape(id)}"]`);

        bar.classList.add('finish')

        bar.classList.add(success ? 'success' : 'failed');

        const status = item.querySelector(`[data-upload-action-box="${CSS.escape(id)}"]`);

        if (status) status.textContent = success ? 'Uploaded' : 'Failed';
    }


    submitUpload(event) {

        event.preventDefault();


        if (
            !Object.keys(this.validFiles).length
        ) {

            alert(
                'No valid file selected.'
            );

            return;

        }


        this.emit(Events.UPLOAD_SIGNAL, {files: this.validFiles});

    }


    finishUpload() {

        this.state.set('upload.loading', false);
    }


}
