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
            ...options,
        };

        this.eventBus = eventBus;
        this.state = state;
        this.errorService = errorService;

        this.files = [];
        this.queue = [];
        this.active = 0;

        this.results = {success: 0, failed: 0};
        this.controllers = new Set();
        this._abort = false;


        this.loadElements(elements);
        this.bindUI();
    }

    loadElements(elements) {
        this.formEl = $(elements.formEl ?? '[data-upload-form]');
        this.dropzoneEl = $(elements.dropzoneEl ?? '[data-dropzone]');
        this.dropzoneEl = $(elements.dropzoneEl ?? '[data-dropzone]');
        this.inputEl = $(elements.inputEl ?? '[data-file-input]');
        this.previewEl = $(elements.previewEl ?? '[data-upload-preview]');
    }

    bindUI() {

        if (!this.dropzoneEl || !this.inputEl || !this.formEl) return;
        this.dropzoneEl.onclick = () => this.inputEl.click();

        this.inputEl.onchange = e => this.setFiles([...e.target.files]);

        ['dragenter', 'dragover'].forEach(ev =>
            this.dropzoneEl.addEventListener(ev, e => {
                e.preventDefault();
                this.dropzoneEl.classList.add('dragging');
            })
        );

        ['dragleave', 'drop'].forEach(ev =>
            this.dropzoneEl.addEventListener(ev, () => {
                this.dropzoneEl.classList.remove('dragging');
            })
        );

        this.dropzoneEl.addEventListener('drop', e => {
            e.preventDefault();
            this.setFiles([...e.dataTransfer.files]);
        });

        this.formEl.addEventListener('submit', e => {
            e.preventDefault();
            this.start()
        })
    }

    setFiles(files) {
        this.files = files;
        this.state.uploadFiles = files;

        this.eventBus.emit(Events.UPLOAD_SELECTED, {files});
    }


    /**
     * START UPLOAD
     */
    async start(disk = null, onProgress = null) {

        this.queue = [...this.files];
        this._abort = false;
        this.results = {success: 0, failed: 0};

        return new Promise(resolve => {

            const next = async () => {

                if (this._abort) return resolve(this.results);

                if (this.queue.length === 0 && this.active === 0) {
                    this.eventBus.emit(Events.UPLOAD_COMPLETE, this.results);
                    return resolve(this.results);
                }

                while (
                    this.active < this.options.concurrency &&
                    this.queue.length > 0
                    ) {
                    const file = this.queue.shift();
                    this.active++;

                    this.uploadFile(file, disk, onProgress)
                        .then(res => {
                            this.results.success++;
                            this.eventBus.emit(Events.UPLOAD_SUCCESS, res);
                        })
                        .catch(err => {
                            this.results.failed++;
                            this.errorService?.emit(err, {
                                context: 'upload',
                                file: file.name
                            });

                            this.eventBus.emit(Events.UPLOAD_FAILED, {file, err});
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
     * XHR upload
     */
    uploadFile(file, disk, onProgress) {

        return new Promise((resolve, reject) => {

            const xhr = new XMLHttpRequest();
            const form = new FormData();

            form.append('file', file);
            if (disk) form.append('disk', disk);

            xhr.open('POST', this.options.endpoint);

            xhr.upload.onprogress = e => {
                if (!e.lengthComputable) return;

                const percent = Math.round((e.loaded / e.total) * 100);

                const payload = {file, percent};

                onProgress?.(payload);
                this.eventBus.emit(Events.UPLOAD_PROGRESS, payload);
            };

            xhr.onload = () => {

                try {
                    const res = JSON.parse(xhr.responseText);

                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(res.data ?? res);
                    } else {
                        throw new Error(`HTTP ${xhr.status}`);
                    }

                } catch (err) {
                    this.errorService?.emit(err, {
                        context: 'upload_parse',
                        file: file.name
                    });

                    reject(err);
                }
            };

            xhr.onerror = () => reject(new Error('Network error'));
            xhr.onabort = () => reject(new Error('Aborted'));

            const controller = new AbortController();
            this.controllers.add(controller);

            xhr.send(form);
        });
    }

    stop() {
        this._abort = true;
        this.queue = [];

        this.controllers.forEach(c => c.abort());
        this.controllers.clear();
    }
}
