import UiService from "../Foundation/UiService.js";
import events from "../constants/events.js";
import {uniqueString} from "../helpers/general.js";
import {escapeHtml} from "../helpers/dom.js";
import formatSize from "../helpers/formatSize.js";
import {getMimeIcon} from "../helpers/mime.js";


export default class UploaderUi extends UiService {

    shouldInitialize() {

        return Boolean(this.formEl && this.dropzoneEl && this.inputEl);
    }


    defineElements() {

        return {

            messagesEl: this.config.get('ui.uploadMessagesSelector'),

            uploadPreviewEl: this.config.get('ui.uploadPreviewSelector'),

            formEl: this.config.get('ui.uploadFormSelector'),

            dropzoneEl: this.config.get('ui.dropzoneSelector'),

            inputEl: this.config.get('ui.fileInputSelector'),

            previewEl: this.config.get('ui.uploadPreviewSelector'),

            diskSelectorEl: this.config.get('ui.uploadDiskSelector'),
        };
    }


    busEvents() {
        return {

            /*    [Events.GRID_CLEAR]: () => {
                    this.emptyGrid();
                },

                'load.append': ({value}) => {
                    this.appendFile(value);
                },*/

        };
    }

    domEvents() {

        return [
            [this.dropzoneEl, 'click', this.resolveClickOnZone],

            [this.dropzoneEl, 'dragover', this.dragOverHandler],

            [this.dropzoneEl, 'drop', this.dropHandler],

            [this.inputEl, 'change', this.changeInputHandler],

            [this.formEl, 'submit', this.FormDefaultSubmit],
        ];

    }

    resolveClickOnZone(event) {
        this.inputEl.click();
    }

    dragOverHandler(event) {

        event.preventDefault();
    }

    dropHandler(event) {

        event.preventDefault();

        this.updateSelectedFiles(event.dataTransfer.files);
    }

    changeInputHandler(event) {

        this.updateSelectedFiles(event.target.files);
    }

    updateSelectedFiles(files) {

        const revoked = this.revokeFiles(files);

        const {validated, failed} = this.validateMimes(revoked);

        this.state.set('upload.files', validated);

        this.renderFileStatus(validated, failed);

    }

    FormDefaultSubmit(event) {

        console.log('FormDefaultSubmit', event);

        this.emit(events.UPLOAD_SIGNAL, {})

    }


    revokeFiles(files = {}) {

        return Object.values(files).reduce((acc, file) => {

            const id = 'fake_' + uniqueString();

            file.id = id;

            acc[id] = file;

            return acc;
        }, {});
    }

    validateMimes(files = {}) {
        const Mimes = this.config.get('upload.allowedMimes', []);

        if (!Mimes.length) return {validated: files};

        const allowedMimes = Mimes.map(mime => mime.toLowerCase());

        let validated = {}

        let failed = {}

        Object.entries(files).forEach(([id, file]) => {
            const filetType = (file.type).toLowerCase();

            return allowedMimes.includes(filetType)
                ? validated[id] = file
                : failed[id] = file
        });

        return {validated, failed}

    }


    renderFileStatus(validated = {}, failed = {}) {
        if (!this.messagesEl) return;
        let message = '';
        message += Object.entries(failed).map(file => this.renderItem(file, false));
        message += Object.entries(validated).map(file => this.renderItem(file, true));

        this.messagesEl.innerHTML = message;
    }

    renderItem([id, file], status) {

        const deleteItem =(event)=>{
            console.log(event)
            const removerBtn =event.target;
            removerBtn.closest('[data-upload-preview]')?.remove();

          if (status){
              const next = this.get('upload.files' ,{});
              delete next[id];

              this.set('upload.files' ,{...next});
          }


        }
        return `
            <div class="upload-item ${status ? 'valid-file' : 'invalid-file'}" data-upload-preview data-file="${file.id}">
                <div>
                    ${getMimeIcon(file.type)}
                    ${escapeHtml(file.name)}
                      ${status ? `
                    <div class="upload-progress">
                        <div class="progress-bar" data-progress="${file.id}"></div>
                    </div>` : '<div>file type error</div> onclick="deleteItem"'}
                    <small data-status="${file.id}" class="upload-status"></small>
                </div>
                <div>
                    <small>${formatSize(file.size ?? 0)}</small>
                    <button onclick="${(e)=>deleteItem(e)}" type="button" data-remove="${file.id}">x</button>
                </div>
            </div>
        `;
    }
}
