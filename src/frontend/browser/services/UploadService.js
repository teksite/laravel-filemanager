import Events from "../constants/events.js";
import BaseService from "../Foundation/BaseServices.js";
import {apiHeaders, extractMessage} from "../helpers/http.js";

export default class UploadService extends BaseService {

    initialize() {

        this.queue = [];

        this.requestSet = new Set();

        this._abort = false;

        this.activeUploads = 0
    }

    busEvents() {

        return {
            [Events.UPLOAD_SIGNAL]: this.startUploading,
        };
    }


    async startUploading() {

        let onProgress = null;

        if (this.state.get('upload.uploading', false)) return;

        this.queue = Array.from(Object.values(this.state.get('upload.files', {})));

        const disk = this.state.get('upload.disk');

        if (this.queue.length === 0) {

            this.errorBus?.emit(new Error('Please select files first'), {context: 'upload_empty'});

            alert('Please select files first');

            return;
        }

        this.results = {success: 0, failed: 0};

        this._abort = false;

        this.state.set('upload.uploading' ,true);

        return new Promise(resolve => {

            const processQueue = () => {

                if (this._abort) {

                    resolve(this.results);

                    return;
                }

                if (this.queue.length === 0 && this.activeUploads === 0) {

                    this.eventBus?.emit(Events.UPLOAD_COMPLETE, this.results);

                    resolve(this.results);

                    this.reset();

                    return;
                }

                while (this.activeUploads < this.options.concurrency && this.queue.length) {

                    const file = this.queue.shift();

                    this.activeUploads++;

                    this.uploadFile(file, disk, onProgress)
                        .then(res => {

                            this.results.success++;

                           const {file : newFile , success} =res;

                            this.eventBus?.emit(Events.UPLOAD_SUCCESS, {
                                response: newFile,
                                file,
                                success: true,
                                error: null
                            });

                        })
                        .catch(err => {

                            this.results.failed++;

                            this.errorBus?.emit(err, {context: 'upload', file: {[file.id]: file}});

                            this.eventBus?.emit(Events.UPLOAD_FAILED, {response: err, file: {[file.id]: file}});

                            this.eventBus?.emit(Events.UPLOAD_FAILED, {
                                response: null,
                                file,
                                success: false,
                                error: err
                            });
                        })
                        .finally(() => {

                            this.activeUploads--;

                            processQueue();
                        });
                }
            };
            processQueue();
        });

    }

    uploadFile(file, disk, onProgress) {

        return new Promise((resolve, reject) => {

                const xhr = new XMLHttpRequest();

                const form = new FormData();

                form.append('file', file);

                if (disk) {

                    form.append('disk', disk);
                }

                const folder = this.state.get('load.folder', null);

                // "root" and "all" are filters, only a real folder id is a valid upload target.
                if (folder && folder !== 'root') {

                    form.append('folder_id', folder);
                }

                xhr.open('POST', this.options.url);

                xhr.withCredentials = true;

                Object.entries(apiHeaders()).forEach(([name, value]) => xhr.setRequestHeader(name, value));

                xhr.timeout = this.options.requestTimeout;

                this.requestSet.add(xhr);

                xhr.upload.onprogress = event => {

                    if (!event.lengthComputable) return;

                    const percent = Math.round((event.loaded / event.total) * 100);

                    const payload = {file, percent};

                    onProgress?.(payload);

                    this.eventBus?.emit(Events.UPLOAD_PROGRESS, payload);
                };

                xhr.onload = () => {

                    this.requestSet.delete(xhr);

                    try {
                        const res = JSON.parse(xhr.responseText);

                        if (xhr.status >= 200 && xhr.status < 300) {

                            resolve(res.data ?? res);

                        } else {

                            const error = new Error(extractMessage(res, `HTTP error | status ${xhr.status}`));

                            error.status = xhr.status;

                            reject(error);
                        }
                    } catch {

                        reject(new Error('Invalid response'));
                    }

                };

                xhr.onerror = () => {

                    this.requestSet.delete(xhr);

                    reject(new Error('Network error'));
                };

                xhr.ontimeout = () => {

                    this.requestSet.delete(xhr);

                    reject(new Error('Upload timeout'));
                };

                xhr.onabort = () => {

                    this.requestSet.delete(xhr);

                    reject(new Error('Upload aborted'));
                };

                xhr.send(form);

            }
        );
    }

    cancel() {

        this._abort = true;

        this.queue = [];

        this.requestSet.forEach(
            xhr => xhr.abort()
        );

        this.requestSet.clear();

        this.activeUploads = 0;

        this.results = {success: 0, failed: 0};

    }


    reset() {

        this.results = {success: 0, failed: 0};

        this.files = {};

        this.state.set('upload.files', {});

        this.state.set('upload.uploading', false);
    }


    destroy() {

        this.cancel();

        super.destroy()
    }
}
