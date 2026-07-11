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

        this.acceptedFiles = {};

        this.rejectedFiles = {};


        const preChosenDisk = this.diskEl.value;

        this.state.set('upload.disk', preChosenDisk);

        this.disk = preChosenDisk;

        this.formElView = this.formEl.innerHTML


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
                this.updateProgress(file, percent)
            },


            [Events.UPLOAD_SUCCESS]: ({response, file, success, error}) => {
                this.showUploadResult(response, file, success, error)
            },


            [Events.UPLOAD_FAILED]: ({response, file, success, error}) => {
                this.showUploadResult(response, file, success, error)
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

            [this.messagesEl, 'click', this.removeFileItem],

            [this.diskEl, 'change', this.changeDiskHandler],
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

        this.prepareUploadFiles(event.dataTransfer.files);
    }

    changeInputHandler(event) {

        this.prepareUploadFiles(event.target.files);

        event.target.value = '';
    }


    prepareUploadFiles(files = []) {

        const normalized = this.prepareFiles(files);

        const mimeResult = this.filterByMimeType(normalized);

        const sizeResult = this.filterBySize(mimeResult.valid);

        this.acceptedFiles = sizeResult.valid;

        this.rejectedFiles = {...mimeResult.invalid, ...sizeResult.invalid};

        this.syncState();

        this.renderFileList();
    }


    renderWaiting() {
        return `<div class="upload-dropzone" data-uoloader-waitng>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 120" width="220" height="180">
    <defs>
        <g id="file">
            <rect x="-12" y="-16" width="24" height="32" rx="3" fill="#ffffff" stroke="#4F8EF7" stroke-width="2"/>
            <polyline points="4,-16 12,-8 12,-16" fill="none" stroke="#4F8EF7" stroke-width="2"/>
        </g>
    </defs>
    <g fill="#4F8EF7">
        <circle cx="90" cy="55" r="18"/>
        <circle cx="110" cy="42" r="24"/>
        <circle cx="135" cy="55" r="18"/>
        <rect x="80" y="55" width="65" height="22" rx="11"/>
    </g>
    <path d="M112 95V55" stroke="#4F8EF7" stroke-width="4" stroke-linecap="round"/>
    <polyline points="102 65 112 53 122 65" fill="none" stroke="#4F8EF7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <use href="#file">
        <animateTransform attributeName="transform" type="translate" values="40 150;112 88;112 60" dur="2.4s" begin="0s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="2.4s" repeatCount="indefinite"/>
    </use>
    <use href="#file">
        <animateTransform attributeName="transform" type="translate" values="70 150;112 88;112 60" dur="2.4s" begin=".45s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="2.4s" begin=".45s" repeatCount="indefinite"/>
    </use>
    <use href="#file">
        <animateTransform attributeName="transform" type="translate" values="100 150;112 88;112 60" dur="2.4s" begin=".9s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="2.4s" begin=".9s" repeatCount="indefinite"/>
    </use>
</svg>
</div>`
    }

    renderForm(isLoading) {
        this.formEl.innerHTML = isLoading
            ? this.renderWaiting()
            : this.formElView;
    }


    submitUpload(event) {

        event.preventDefault();

        const disk = this.state.get('upload.disk', null);

        if (!this.validateDisk(disk)) return;

        this.emit(Events.UPLOAD_SIGNAL, {files: this.acceptedFiles, disk, event});

    }

    handleUploadingStage() {

        const state = this.state.get('upload.uploading', false);

        this.renderForm(state);
    }

    finishUpload() {

        this.state.set('upload.uploading', false);

        this.messagesEl?.children &&
        [...this.messagesEl.children].forEach((item, index) => {
            setTimeout(() => {

                item.remove();

            }, 3000 + (500 *  index));
        });
    }


    syncState() {

        this.state.set('upload.files', this.acceptedFiles);
    }

    prepareFiles(files) {

        let items = {}

        Object.entries(files).forEach(([id, item,]) => {

            const fileId = `fake_${uniqueString()}`;

            item.id = fileId;

            return items[fileId] = item;
        });

        return items;
    }


    filterByMimeType(files = {}) {
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

                file.error = 'invalid type';

                invalid[id] = file;
            }
        });

        return {valid, invalid};
    }

    filterBySize(files = {}) {

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
                file.error = `max size ${formatSize(maxSize)}`;

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


    renderFileList() {

        if (!this.messagesEl) return;

        const invalid = Object.entries(this.rejectedFiles)
            .map((item) => this.renderFileItem(item, false));

        const valid = Object.entries(this.acceptedFiles)
            .map((item) => this.renderFileItem(item, true));

        this.messagesEl.innerHTML = [...invalid, ...valid].join('');
    }

    renderFileItem([id, file], valid) {

        return `
            <div class="upload-item ${valid ? 'is-success' : 'is-error'}" data-upload-preview data-file-id="${file.id}">
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
                            ${valid ? 'ready to upload' : (file?.reason ? `${file.error}` : "invalid file")}
                        </small>
                   </div>
                    <button type="button" data-remove-message="${file.id}">
                        ×
                    </button>
                </div>
            </div>`;
    }


    updateProgress(file, percent) {

        const progressBarEl = this.$(`[data-progress-bar='${file.id}']`);

        const messageBoxEl = progressBarEl?.closest('[data-upload-preview]');

        const uploadStatusEl = messageBoxEl?.querySelector('[data-upload-status]');

        if (progressBarEl) {

            progressBarEl.style.setProperty("width", `${percent}%`, "important");

            if (percent == 100) progressBarEl.classList.add('completed')
        }


        if (messageBoxEl) messageBoxEl.classList.remove('is-success', 'is-error');

        if (uploadStatusEl) uploadStatusEl.textContent = 'uploading ...'


    }


    showUploadResult(response, file, success, error) {

        const progressBarEl = this.$(`[data-progress-bar='${file.id}']`);

        const messageBoxEl = progressBarEl?.closest('[data-upload-preview]');

        const uploadStatusEl = messageBoxEl?.querySelector('[data-upload-status]');


        if (progressBarEl) progressBarEl.classList.add(success ? 'success' : 'failed');

        if (messageBoxEl) messageBoxEl.classList.add(success ? 'is-success' : 'is-error')

        if (uploadStatusEl) uploadStatusEl.textContent = success ? 'succeed' : error


    }

    removeFileItem(event) {

        const button = event.target.closest('[data-remove-message]');

        if (!button) return;

        const id = button.dataset.removeMessage;

        delete this.acceptedFiles[id];

        delete this.rejectedFiles[id];

        this.syncState();

        button.closest('[data-upload-preview]')?.remove();
    }


}
