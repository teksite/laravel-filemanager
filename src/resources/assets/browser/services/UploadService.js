import {$} from "../helpers/dom.js";
import Events from "../constants/events.js";
import BaseService from "../Foundation/BaseServices.js";

export default class UploadService extends BaseService{

    busEvents() {

        return {

            [Events.UPLOAD_SIGNAL]: this.startUploading,

        };
    }

    isUploading() {
        return this.state.get('upload.uploading' , false);
    }

    async startUploading(onProgress = null) {

        if (this.isUploading()) return;


        this.files = this.state.get('upload.files', {})


         = selectedFiles;

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
                            const file = res.file;
                            this.eventBus?.emit(Events.UPLOAD_SUCCESS,
                                {
                                    response: res,
                                    file: {
                                        [file.id]: file
                                    }
                                });
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


    reset() {
        this.toggleLoadingStatus(false)
        this.results = {success: 0, failed: 0};
        this.files = [];
        this.state.set('upload.files', [])
    }


    destroy() {

        this.stop();

        super.destroy()
    }
}
