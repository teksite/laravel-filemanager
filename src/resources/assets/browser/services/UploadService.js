import {$} from "../helpers/dom.js";
import UploaderPreviewUi from "../ui/UploaderPreviewUi.js";

export default class UploadService {
    files = []

    constructor({url, els = {}}, eventBus) {
        const dropzoneEl = els?.dropzoneEl ?? '[data-dropzone]';
        const inputEl = els?.inputEl ?? '[data-file-input]';


        this.dropzoneEl = $(dropzoneEl);
        this.inputEl = $(inputEl);
        this.previewElSelector = els?.previewEl ?? '[data-upload-preview]';


        const isBind = this.bindClickAction(this.dropzoneEl, this.inputEl);
        if (isBind) this.init(this.inputEl);
    }

    bindClickAction() {
        if (!this.dropzoneEl || !this.inputEl) return false;
        this.dropzoneEl.onclick = () => this.inputEl.click();
        return true;
    }

    init(inputEl) {
        inputEl.onchange = e => this.setFiles([...e.target.files]);
        this.dragInAction();
        this.dragOutAction();
        this.dropAction();
    }

    dragInAction() {
        ['dragenter', 'dragover'].forEach(ev =>
            this.dropzoneEl.addEventListener(ev, e => {
                e.preventDefault();
                this.dropzoneEl.classList.add('dragging');
            })
        );
    }

    dragOutAction() {
        ['dragleave', 'drop'].forEach(ev =>
            this.dropzoneEl.addEventListener(ev, () => this.dropzoneEl.classList.remove('dragging'))
        );
    }

    dropAction() {
        this.dropzoneEl.addEventListener('drop', e => {
            e.preventDefault();
            this.setFiles([...e.dataTransfer.files]);
        });
    }

    setFiles(files = []) {
        this.files = files;
        new UploaderPreviewUi({
            uploadPreviewEl: this.previewElSelector,
            files: this.files
        });
    }


    /*

        async upload() {

            this.clearUploadMessages();

            if (!this.uploadFiles.length) {
                this.showUploadMessage('Please select files first.', 'warning');
                return;
            }

            const disk = this.elements.uploadDisk?.value;

            this.uploadQueue = [...this.uploadFiles];
            this.uploadActive = 0;

            this.uploadSummary = {
                success: 0,
                failed: 0
            };

            return new Promise((resolve) => {

                const next = () => {

                    if (this.uploadQueue.length === 0 && this.uploadActive === 0) {

                        // FINAL SYNC (only once)
                        this.load(true);

                        this.showUploadMessage(
                            `Upload done: ${this.uploadSummary.success} success`,
                            'success'
                        );

                        this.resetUploader();
                        resolve();
                        return;
                    }

                    while (
                        this.uploadActive < this.uploadConcurrency &&
                        this.uploadQueue.length > 0
                        ) {

                        const file = this.uploadQueue.shift();
                        this.uploadActive++;

                        const form = new FormData();
                        form.append('file', file);
                        form.append('disk', disk);

                        this.uploadSingle(file, form)
                            .then((serverItem) => {

                                this.uploadSummary.success++;

                                // 🔥 HYBRID UI UPDATE (NO FULL LOAD)
                                if (this.isUploadVisible(serverItem, disk, this.state.mimeType)) {
                                    this.prependFiles([serverItem]);
                                }

                            })
                            .catch(() => {
                                this.uploadSummary.failed++;
                            })
                            .finally(() => {
                                this.uploadActive--;
                                next();
                            });
                    }
                };

                next();
            });
        }

    */
}
