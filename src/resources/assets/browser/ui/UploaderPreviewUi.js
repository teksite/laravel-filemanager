import {$} from "../helpers/dom.js";
import Events from "../constants/events.js";
import formatSize from "../helpers/formatSize.js";

export default class UploaderPreviewUi {
    constructor({uploadPreviewSelector = null} = {}, eventBus) {

        const selector = uploadPreviewSelector ?? '[data-upload-preview]';
        this.uploadPreviewEl = $(selector);
        this.eventBus = eventBus;

        this.render();
    }

    render() {
        this.eventBus.on(Events.UPLOAD_SELECTED, ({files}) => {
            this.uploadPreviewEl.innerHTML = this.renderList(files);
        });
    }

    renderList(files) {
        let html = '';
        if (!files.length) return html;
        for (const file of files) {
            html += this.renderItem(file);
        }
        return html;
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
            <small>${formatSize(size ?? 0)}</small>
        </div>
       `
    }



}
