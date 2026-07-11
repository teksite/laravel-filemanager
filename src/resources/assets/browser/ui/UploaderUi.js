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

        this.invalidFiles = {};


        const value = this.diskEl.value;

        this.state.set('upload.disk', value);

        this.disk = value;
    }


    defineElements() {

        return {

            messagesEl: this.config.get('ui.uploadMessagesSelector'),

            formEl: this.config.get('ui.uploadFormSelector'),

            dropzoneEl: this.config.get('ui.dropzoneSelector'),

            inputEl: this.config.get('ui.fileInputSelector'),

            diskEl: this.config.get('ui.uploadDiskSelector'),
        };
    }


    busEvents() {

        return {
            [Events.UPLOAD_COMPLETE]: () => {
                this.finishUpload();
            },

            [Events.UPLOAD_PROGRESS]: ({file, percent}) => {
                this.showProgress(file, percent)
            },


            [Events.UPLOAD_SUCCESS]: ({response, file ,success, error}) => {
                this.revealSingleUploadResult(response, file ,success, error)
            },

            'upload.uploading': () => {
                this.handleUploadingStage();
            },
        };
    }


    domEvents() {

        return [

            [this.dropzoneEl, 'click', this.openFileDialog],

            [this.dropzoneEl, 'dragover', this.preventDefault],

            [this.dropzoneEl, 'drop', this.dropFiles],

            [this.inputEl, 'change', this.changeInputHandler],

            [this.formEl, 'submit', this.submitUpload],

            [this.messagesEl, 'click', this.removeMessage],


            [this.diskSelectorEl, 'change', this.changeDiskHandler],
        ];
    }


    changeDiskHandler() {

        const value = this.diskEl.value;

        if (!this.validateDisk(value)) {

            this.diskEl.value = this.disk;
        }

        this.state.set('upload.disk', value);

        this.disk = value;
    }

    openFileDialog() {

        this.inputEl.click();
    }

    dropFiles(event) {

        event.preventDefault();

        this.handleFiles(event.dataTransfer.files);
    }

    changeInputHandler(event) {

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


    submitUpload(event) {

        event.preventDefault();

        const disk = this.state.get('upload.disk', null);

        if (!this.validateDisk(disk)) return;

        this.emit(Events.UPLOAD_SIGNAL, {files: this.validFiles, disk, event});

    }

    handleUploadingStage() {

        const state = this.state.get('upload.loading', false);

        state ? this.formEl.disabled = true : this.formEl.disabled = false;

        state ? this.formEl.classList.add('is-hidden') : this.formEl.classList.remove('is-hidden');
    }

    finishUpload() {

        this.state.set('upload.loading', false);
    }


    syncState() {

        this.state.set('upload.files', this.validFiles);
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

    validateDisk(disk) {

        if (![...this.config.get('upload.allowedDisks')].includes(disk)) {

            alert(`No valid disk (${disk}) selected.`);

            return false;
        }

        return true;
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


    showProgress(file, percent) {

        const progressBarEl = this.$(`[data-progress-bar='${file.id}']`);

        const messageBoxEl = progressBarEl?.closest('[data-upload-preview]');

        if (progressBarEl) {

            progressBarEl.style.width = percent + "%!important"

            if (percent == 100) progressBarEl.classList.add('completed')
        }


        if (messageBoxEl) {

            messageBoxEl.classList.remove('valid-file', 'invalid-file')
        }

    }


    revealSingleUploadResult(response, file ,success, error) {

        const progressBarEl = this.$(`[data-progress-bar='${file.id}']`);

        const messageBoxEl = progressBarEl?.closest('[data-upload-preview]');

        if (progressBarEl) {

            progressBarEl.classList.add(success ? 'success' : 'failed');
        }

        if (messageBoxEl) {
            console.log(error)
            messageBoxEl.classList.add(success ? 'valid-file' : 'invalid-file')
        }


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


}
