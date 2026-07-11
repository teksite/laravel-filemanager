import Events from "../constants/events.js";
import BaseService from "../Foundation/BaseServices.js";

export default class UploadService extends BaseService {

    initialize() {

        this.queue = {};

        this.requestSet = new Set();

        this._abort = false;

        this.active = 0
    }

    busEvents() {

        return {
            [Events.UPLOAD_SIGNAL]: this.startUploading,
        };
    }


    async startUploading() {

        let onProgress = null

        if (this.state.get('upload.uploading', false)) return;

        this.queue = this.state.get('upload.files', {});

        const disk = this.state.get('upload.disk');


        if (this.queueLength() === 0) {

            this.errorBus?.emit(new Error('Please select files first'), {context: 'upload_empty'});

            alert('Please select files first');

            return;
        }

        this.results = {success: 0, failed: 0};

        this._abort = false;

        return new Promise(resolve => {

            const arrayFile = Array.from(Object.values(this.queue));

            const next = () => {

                if (this._abort) {

                    resolve(this.results);

                    return;
                }

                if (arrayFile.length === 0 && this.active === 0) {

                    this.eventBus?.emit(Events.UPLOAD_COMPLETE, this.results);

                    resolve(this.results);

                    this.reset();

                    return;
                }

                this.state.set('upload.uploading', true);


                while (this.active < this.options.concurrency && arrayFile.length) {

                    const file = arrayFile.shift();

                    this.active++;

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

                            this.errorService?.emit(err, {context: 'upload', file: {[file.id]: file}});

                            this.eventBus?.emit(Events.UPLOAD_FAILED, {response: err, file: {[file.id]: file}});

                            this.eventBus?.emit(Events.UPLOAD_FAILED, {
                                response: null,
                                file,
                                success: false,
                                error: err
                            });
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

        return new Promise((resolve, reject) => {

                const xhr = new XMLHttpRequest();

                const form = new FormData();

                form.append('file', file);

                if (disk) {

                    form.append('disk', disk);
                }

                xhr.open('POST', this.options.url);

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
                            //Todo add response 422 403
                            reject(new Error(`HTTP error | status ${xhr.status}`));
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

    stop() {

        this._abort = true;

        this.queue = [];

        this.requestSet.forEach(
            xhr => xhr.abort()
        );

        this.requestSet.clear();

        this.active = 0;

        this.results = {success: 0, failed: 0};

    }

    queueLength() {

        return Object.keys(this.queue).length;
    }


    reset() {

        this.state.set('upload.uploading', false)

        this.results = {success: 0, failed: 0};

        this.files = {};

        this.state.set('upload.files', {});

    }


    destroy() {

        this.stop();

        super.destroy()
    }
}
