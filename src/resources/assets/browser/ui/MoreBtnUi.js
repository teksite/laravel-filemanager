import {$, escapeHtml} from "../helpers/dom.js";
import Events from "../constants/events.js";
import formatSize from "../helpers/formatSize.js";
import {getMimeIcon} from "../helpers/mime.js";
import {uniqueString} from "../helpers/general.js";
import events from "../constants/events.js";

export default class UploaderPreviewUi {

    constructor({btnEl = null} = {}, eventBus, stateManager) {

        this.eventBus = eventBus;
        this.state = stateManager;

        this.listeners = [];

        const selector = btnEl ?? '[data-load-more]';

        this.moreBtn = $(selector);


        if (!this.uploadPreviewEl) return;

        this.bindDomEvents();
        this.bindBusEvents();
    }

    bindBusEvents() {
        this.listeners = {
            removeBtn: (e) => {
                e.preventDefault();
                this.removeBtn()
            },

        };
        this.eventBus.on(Events.FILES_NO_MORE, this.listeners.removeBtn);

    }


    bindDomEvents() {

        this.moreBtn.addEventListener('click', e => {
            e.preventDefault();
            this.requestMoreEvent()
        });
    }

    requestMoreEvent() {
        console.log('ddddddddddddddddd')
        const isLoading = this.state.get('load.loading');
        const hasMore = this.state.get('load.hasMore');
        if (isLoading === true || hasMore === false) return;
        this.eventBus.emit(events.FILES_NEED_MORE, {})
    }

    removeBtn() {
        this.moreBtn.remove();
        this.eventBus.off(Events.FILES_NO_MORE, this.listeners.removeBtn);


    }


    destroy() {
        this.eventBus.off(Events.FILES_NO_MORE, this.listeners.removeBtn);
        this.moreBtn.removeEventListener('click', e => {
            this.requestMoreEvent()
        })
    }

}
