import {$} from "../helpers/dom.js";
import Events from "../constants/events.js";

export default class UploadService {

    constructor({url, elements = {}, options = {}}, eventBus, state, errorService) {

        this.options = {
            endpoint: url ?? '/api/filemanager',
            concurrency: 3,
            requestTimeout: 15000,
            allowedMimes: [],
            allowedDisks: [],
            ...options
        };
        this.handlers = [];

        this.eventBus = eventBus;
        this.state = state;
        this.errorService = errorService;

        this.files = [];
        this.queue = [];
        this.active = 0;

        this.results = {
            success: 0,
            failed: 0
        };

        this.requests = new Set();
        this._abort = false;

        this.loadElements(elements);
        this.bindUI();
    }

    loadElements(elements) {

        this.formEl = $(elements.formEl ?? '[data-upload-form]');

        this.dropzoneEl = $(elements.dropzoneEl ?? '[data-dropzone]');

        this.inputEl = $(elements.inputEl ?? '[data-file-input]');

        this.previewEl = $(elements.previewEl ?? '[data-upload-preview]');

        this.diskSelectorEl = $(elements.diskSelectorEl ?? '[data-upload-disk]');
    }

    bindUI() {

        if (!this.formEl || !this.dropzoneEl || !this.inputEl) return;

        this.dropzoneEl.onclick = () => {
            this.inputEl.click();
        };

        this.handlers = {

            click: () => {
                this.inputEl.click();
            },

            change: (e) => {
                this.setFiles([...e.target.files]);
            },

            submit: (e) => {
                e.preventDefault();
                this.start();
            },

            drop: (e) => {
                e.preventDefault();
                this.setFiles([...e.dataTransfer.files]);
            }

        };

        this.dropzoneEl.addEventListener('click', this.handlers.click);

        this.inputEl.addEventListener('change', this.handlers.change);

        this.formEl.addEventListener('submit', this.handlers.submit);

        this.dropzoneEl.addEventListener('drop', this.handlers.drop);
    }

    setFiles(files = []) {
        this.files = files;
        this.state.set('upload.files', files);
        this.eventBus?.emit(Events.UPLOAD_SELECTED, {files});
    }


    /*===== Upload Process ======*/

    async start(onProgress = null) {
        if (this.isUploading()) {
            return;
        }

        const selectedFiles = this.state.get('upload.files', [])

        this.files = selectedFiles;

        if (!selectedFiles.length) {
            this.errorService?.emit(new Error('Please select files first'), {context: 'upload_empty'});
            alert('Please select files first')
            return;
        }

        const selectedDisk = this.diskSelectorEl?.value ?? null;

        if (!this.validatingDisk(selectedDisk)) {
            this.errorService?.emit(new Error('Invalid disk selected'), {context: 'upload_disk', disk: selectedDisk});
            alert('Please a correct disk to upload')
            return;
        }

        this.queue = [];

        for (const file of selectedFiles) {
            if (!this.validatingMime(file)) {

                this.results.failed++;

                this.errorService?.emit(new Error(`File type not allowed: ${file.name}`), {
                        context: 'upload_mime',
                        file: file.name,
                        mime: file.type
                    }
                );
                continue;
            }
            this.queue.push(file);
        }

        if (!this.queue.length) return;


        this.results = {success: 0, failed: this.results.failed};

        this._abort = false;

        return new Promise(resolve => {

            const next = () => {

                if (this._abort) {
                    resolve(this.results);
                    return;
                }

                if (this.queue.length === 0 && this.active === 0) {
                    this.eventBus?.emit(Events.UPLOAD_COMPLETE, this.results);
                    resolve(this.results);
                    this.reset();


                    return;
                }
                this.toggleLoadingStatus(false)

                while (this.active < this.options.concurrency && this.queue.length) {

                    const file = this.queue.shift();
                    this.active++;

                    this.uploadFile(file, selectedDisk, onProgress)
                        .then(res => {
                            this.results.success++;
                            this.eventBus?.emit(Events.UPLOAD_SUCCESS, {response: res, file});
                        })
                        .catch(err => {
                            this.results.failed++;
                            this.errorService?.emit(err, {context: 'upload', file: file.name});
                            this.eventBus?.emit(Events.UPLOAD_FAILED, {file, error: err});
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

    uploadFile(file, disk, onProgress) {

        return new Promise(
            (resolve, reject) => {

                const xhr = new XMLHttpRequest();

                const form = new FormData();

                form.append('file', file);

                if (disk) {
                    form.append('disk', disk);
                }

                xhr.open('POST', this.options.endpoint);

                xhr.timeout = this.options.requestTimeout;

                this.requests.add(xhr);

                xhr.upload.onprogress = e => {
                    if (!e.lengthComputable) return;

                    const percent = Math.round((e.loaded / e.total) * 100);

                    const payload = {file, percent};

                    onProgress?.(payload);

                    this.eventBus?.emit(Events.UPLOAD_PROGRESS, payload);
                };

                xhr.onload = () => {

                    this.requests.delete(xhr);

                    try {
                        const res = JSON.parse(xhr.responseText);
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(res.data ?? res);
                        } else {
                            //Todo add response 422 403
                            reject(new Error(`HTTP error | status ${xhr.status}`));
                        }
                    } catch {
                        reject(new Error('Invalid response'));
                    }

                };

                xhr.onerror = () => {
                    this.requests.delete(xhr);
                    reject(new Error('Network error'));
                };

                xhr.ontimeout = () => {
                    this.requests.delete(xhr);
                    reject(new Error('Upload timeout'));
                };

                xhr.onabort = () => {
                    this.requests.delete(xhr);
                    reject(new Error('Upload aborted'));
                };

                xhr.send(form);

            }
        );
    }

    stop() {

        this._abort = true;

        this.queue = [];

        this.requests.forEach(
            xhr => xhr.abort()
        );
        this.requests.clear();

        this.active = 0;

        this.results = {
            success: 0,
            failed: 0
        };

    }


    validatingDisk(disk) {

        const disks = this.options.allowedDisks;

        if (!disks.length) return true;

        return disks.includes(disk);
    }

    validatingMime(file) {

        const mimes = this.options.allowedMimes;

        if (!mimes.length) return true;

        return mimes.includes(file.type);
    }


    toggleLoadingStatus(status = false) {
        this.state.set('upload.uploading', status);
    }


    isUploading() {
        return this.state.get('upload.uploading') ?? false;
    }

    reset() {
        this.toggleLoadingStatus(false)
        this.results = {success: 0, failed: 0};
        this.files = [];
        this.state.set('upload.files', [])
    }


    destroy() {

        this.stop();

        this.dropzoneEl?.removeEventListener('click', this.handlers.click);

        this.inputEl?.removeEventListener('change', this.handlers.change);

        this.formEl?.removeEventListener('submit', this.handlers.submit);

        this.dropzoneEl?.removeEventListener('drop', this.handlers.drop);

    }
}
