import {$} from "../helpers/dom.js";

export default class UploaderPreviewUi {

    constructor({uploadPreviewEl = null}) {
        const uploadPreviewElElector = uploadPreviewEl ??'[data-upload-preview]';
        console.log(uploadPreviewEl , uploadPreviewElElector)
        this.uploadPreviewEl = $(uploadPreviewElElector);

        console.log(uploadPreviewEl)
    }

    renderItem({name, lastModified = null, size = null}) {
        return `
        <div class="upload-item">
            <div>
                ${name}
                <div class="upload-progress">
                    <span data-progress="${name}-${lastModified ?? '-'}"></span>
                </div>
            </div>
            <small>${size}</small>
        </div>
       `
    }

    renderList(files) {
        let el = ''
        if (files?.count() === 0) return el
        for (const {name, lastModified, size} of files) {
            el += this.renderItem({name, lastModified, size})
        }
        return el;
    }

    render(files) {
        const container = this.uploadPreviewEl;
        container.innerHTML = '';
        container.innerHTML = this.renderList(files);
    }
}
