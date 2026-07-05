import {$} from "../helpers/dom.js";
import Events from "../constants/events.js";

export default class UploadService {

    constructor({url, els = {}}, eventBus = null, stateManager, request) {

        this.files = [];
        this.queue = [];
        this.active = 0;
        this.results = {
            success: 0,
            failed: 0
        };

        this._abort = false;


        this.eventBus = eventBus;
        this.state = stateManager;

        this.loadElFromSelector(els);


        if (this.bindClickAction(this.dropzoneEl, this.inputEl)) this.init(this.inputEl);
    }

    loadElFromSelector(els) {
        const dropzoneEl = els?.dropzoneEl ?? '[data-dropzone]';
        const inputEl = els?.inputEl ?? '[data-file-input]';

        const previewEl = els?.previewEl ?? '[data-upload-preview]';

        this.dropzoneEl = $(dropzoneEl);
        this.inputEl = $(inputEl);
        this.previewEl = $(previewEl);
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
            const files = [...e.dataTransfer.files];
            this.setFiles(files);
        });
    }

    setFiles(files = []) {
        this.files = files;
        this.state.uploadFiles = files;
        this.eventBus.emit(Events.UPLOAD_SELECTED, {files: this.files});
    }



    /* ======== Upload api ============== */

    /**
     * Start upload process
     */
    async start(disk = null, onProgress = null) {

        if (!this.queue.length) {
            throw this.request.err;
        }

        this._abort = false;

        return new Promise((resolve) => {

            const next = () => {

                if (this._abort) {
                    resolve(this.results);
                    return;
                }

                if (this.queue.length === 0 && this.active === 0) {

                    this.emit(Events.UPLOAD_COMPLETE, this.results);
                    resolve(this.results);
                    return;
                }

                while (
                    this.active < this.options.concurrency &&
                    this.queue.length > 0
                    ) {
                    const file = this.queue.shift();
                    this.active++;

                    this.uploadFile(file, disk, onProgress)
                        .then((res) => {

                            this.results.success++;

                            this.emit(EVENTS.UPLOAD_SUCCESS, res);

                        })
                        .catch((err) => {

                            this.results.failed++;

                            this.errorService?.emit(err, {
                                context: 'upload',
                                file: file.name
                            });

                            this.emit(EVENTS.UPLOAD_FAILED, {file, error: err});
                        })
                        .finally(() => {
                            this.active--;
                            next();
                        });
                }
            };

            next();
        });
    }

    /**
     * Upload single file (XHR for progress support)
     */
    uploadFile(file, disk = null, onProgress = null) {

        return new Promise((resolve, reject) => {

            const xhr = new XMLHttpRequest();
            const form = new FormData();

            form.append('file', file);

            if (disk) {
                form.append('disk', disk);
            }

            xhr.open('POST', this.options.endpoint);

            /**
             * Progress handler
             */
            xhr.upload.onprogress = (e) => {

                if (!e.lengthComputable) return;

                const percent = Math.round((e.loaded / e.total) * 100);

                const payload = {
                    file,
                    percent
                };

                if (typeof onProgress === 'function') {
                    onProgress(payload);
                }

                this.emit(EVENTS.UPLOAD_PROGRESS, payload);
            };

            /**
             * Success
             */
            xhr.onload = () => {

                let response = null;

                try {
                    response = JSON.parse(xhr.responseText);
                } catch (e) {
                    const err = new Error('Invalid JSON response');

                    this.errorService?.emit(err, {
                        context: 'upload_parse',
                        file: file.name
                    });

                    return reject(err);
                }

                if (xhr.status >= 200 && xhr.status < 300) {

                    const data = response?.data ?? response;

                    resolve(data);

                } else {

                    const err = new Error(`Upload failed: ${xhr.status}`);

                    this.errorService?.emit(err, {
                        context: 'upload',
                        status: xhr.status,
                        file: file.name,
                        response
                    });

                    reject(err);
                }
            };

            /**
             * Network error
             */
            xhr.onerror = () => {

                const err = new Error('Network error during upload');

                this.errorService?.emit(err, {
                    context: 'upload_network',
                    file: file.name
                });

                reject(err);
            };

            /**
             * Abort support
             */
            xhr.onabort = () => {

                const err = new Error('Upload aborted');

                this.errorService?.emit(err, {
                    context: 'upload_abort',
                    file: file.name
                });

                reject(err);
            };

            xhr.send(form);
        });
    }

    /**
     * Stop all uploads gracefully
     */
    stop() {
        this._abort = true;
        this.queue = [];
    }

    /**
     * Emit event safely
     */
    emit(event, payload) {
        if (!this.eventBus?.emit) return;

        try {
            this.eventBus.emit(event, payload);
        } catch (e) {
            console.error('[UploadService Event Error]', e);
        }
    }


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

}
