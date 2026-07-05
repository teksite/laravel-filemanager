export default class UploadService {
    files = []

    constructor({url, els = {}}) {
        this.endpoint = url;
        this.dropzoneEl = els?.dropzone ?? '[data-file-input]';
        this.inputEl = els?.dropzone ?? '[data-dropzone]';
    }


    setFiles(files = []) {
        this.files = files;
        this.renderUploadPreview();
    }

    renderUploadPreview() {
        const container = this.elements.uploadPreview;
        container.innerHTML = '';

        for (const file of this.uploadFiles) {
            container.insertAdjacentHTML('beforeend', `
                <div class="upload-item">
                    <div>
                        ${file.name}
                        <div class="upload-progress">
                           <span data-progress="${file.name}-${file.lastModified}"></span>
                        </div>
                    </div>
                    <small>${this.formatSize(file.size)}</small>
                </div>
            `);
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
