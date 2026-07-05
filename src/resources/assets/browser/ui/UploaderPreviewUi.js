import {$} from "../helpers/dom.js";
import Events from "../constants/events.js";
import formatSize from "../helpers/formatSize.js";
import {getMimeIcon} from "../helpers/mime.js";

export default class UploaderPreviewUi {
    constructor({uploadPreviewSelector = null} = {}, eventBus , stateManager) {

        this.files = [];
        this.eventBus = eventBus;
        this.state = stateManager;

        const selector = uploadPreviewSelector ?? '[data-upload-preview]';
        this.uploadPreviewEl = $(selector);

        this.bindDomEvents();
        this.bindBusEvents();
        this.render();

    }

    bindBusEvents() {
        this.eventBus.on(Events.UPLOAD_SELECTED, ({ files }) => {
            this.files = files;
            this.render();
        });

        this.eventBus.on(Events.UPLOAD_SUCCESS, ({ file }) => {
            this.files = files;
            this.render();
        });
    }

    render() {
        this.uploadPreviewEl.innerHTML = this.renderList(this.files);
    }

    renderList(files) {
        if (!files.length) return '';

        return files
            .map((file, index) => this.renderItem(file, index))
            .join('');
    }

    renderItem(file, index) {
        return `
            <div class="upload-item">
                <div>
                    ${getMimeIcon(file.type)} ${file.name}
                    <div class="upload-progress">
                        <span data-progress="${file.name}-${file.lastModified ?? '-'}"></span>
                    </div>
                </div>
                <small>${formatSize(file.size ?? 0)}</small>
                <button type="button" data-remove="${index}">
                    x
                </button>
            </div>
        `;
    }

    bindDomEvents() {
        this.uploadPreviewEl.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-remove]');
            if (!btn) return;
            const index = Number(btn.dataset.remove);
            this.remove(index);
        });
    }

    remove(index) {
        this.files.splice(index, 1);
        this.state.uploadFiles = this.files;
        console.log(this.state.uploadFiles)
        this.render();
    }




}
