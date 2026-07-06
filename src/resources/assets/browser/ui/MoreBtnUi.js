import {$} from "../helpers/dom.js";
import Events from "../constants/events.js";
import events from "../constants/events.js";

export default class MoreBtnUi {

    constructor({btnEl = null} = {}, eventBus, stateManager) {

        const selector = btnEl ?? '[data-load-more]';
        this.moreBtn = $(selector);
        if (!this.moreBtn) return;


        this.eventBus = eventBus;
        this.state = stateManager;

        this.listeners = [];




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
