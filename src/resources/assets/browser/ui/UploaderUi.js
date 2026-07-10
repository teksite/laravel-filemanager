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

            [this.messagesEl, 'click', this.removeFile],
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

        console.log(normalized)
        const mimeResult = this.validateMime(normalized);

        const sizeResult = this.validateSize(mimeResult.valid);

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


    validateMime(files = {}) {
        const allowed = this.config.get('upload.allowedMimes', [])
            .map(item => item.toLowerCase());

        if (!allowed.length)  return {valid: files, invalid: {}};

        const valid = {};

        const invalid = {};

        Object.entries(files).forEach(([id, file]) => {

            const mime = (file.type || '').toLowerCase();

            if (allowed.includes(mime)) {

                valid[id] = file;
            } else {

                invalid['reason'] = 'invalid type file';

                invalid[id] = file;
            }
        });
        return {valid, invalid};
    }


    validateSize(files = {}) {

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


    renderItem([id , file], valid) {
        console.log(file)
        return `
            <div class="upload-item ${valid ? 'valid-file' : 'invalid-file'}" data-upload-preview data-file-id="${file.id}">
                <div class="upload-file-info">
                     ${getMimeIcon(file.type)}
                     ${escapeHtml(file.name)}
                    <div class="info">
                        <div class="upload-progress"><div class="progress-bar" data-progress-bar="${file.id}"></div></div>
                        <small data-upload-status="${file.id}">${valid ? 'ready to upload' : 'invalid file'}</small>
                    </div>
                </div>
                <div class="upload-file-action">
                    <small>
                        ${formatSize(file.size)}
                    </small>
                    <button type="button" data-remove-file="${file.id}">
                        ×
                    </button>
                </div>
            </div>`;
    }


    removeFile(event) {


        const button =
            event.target.closest(
                '[data-remove-file]'
            );


        if (!button) {
            return;
        }


        const id = button.dataset.removeFile;


        delete this.validFiles[id];

        delete this.invalidFiles[id];


        this.syncState();


        button
            .closest(
                '[data-upload-preview]'
            )
            ?.remove();


    }


    updateUploadStatus(
        id,
        success,
        file
    ) {


        const item =
            this.messagesEl?.querySelector(
                `[data-file-id="${CSS.escape(id)}"]`
            );


        if (!item) {
            return;
        }


        item.classList.toggle(
            'valid-file',
            success
        );


        item.classList.toggle(
            'invalid-file',
            !success
        );


        const bar =
            item.querySelector(
                `[data-progress-bar="${CSS.escape(id)}"]`
            );


        if (bar) {

            bar.style.width = '100%';

            bar.classList.toggle(
                'success',
                success
            );


            bar.classList.toggle(
                'failed',
                !success
            );

        }


        const status =
            item.querySelector(
                `[data-upload-status="${CSS.escape(id)}"]`
            );


        if (status) {

            status.textContent =
                success
                    ?
                    'Uploaded'
                    :
                    'Failed';

        }


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


        this.emit(
            Events.UPLOAD_SIGNAL,
            {
                files: this.validFiles
            }
        );


    }


    finishUpload() {


        this.state.set(
            'upload.loading',
            false
        );


    }


}
