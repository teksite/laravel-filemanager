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
            removeBtn: ({value}) => {
                this.removeBtn(value)
            },
            updateBtn :  ({value}) => {
                this.updateBtn(value)
            },

        };
        this.eventBus.on('load.hasMore', this.listeners.removeBtn);
        this.eventBus.on('load.loading', this.listeners.updateBtn);

    }


    bindDomEvents() {

        this.moreBtn.addEventListener('click', e => {
            e.preventDefault();
            this.requestMoreEvent()
        });
    }

    requestMoreEvent() {
        const isLoading = this.state.get('load.loading');
        const hasMore = this.state.get('load.hasMore');
        if (isLoading || !hasMore ) return;

        this.eventBus.emit(events.FILES_NEED_MORE, {});
    }

    removeBtn(value) {
       if (!value){
           this.moreBtn.remove();
           this.eventBus.off('load.hasMore', this.listeners.removeBtn);
           this.eventBus.off('load.loading', this.listeners.removeBtn);
       }
    }

    updateBtn(value) {

        if (value){
            this.moreBtn.disabled =true;
            this.moreBtn.innerText = 'loading ...'
            return;
        }
        this.moreBtn.disabled =false;
        this.moreBtn.innerText = 'Load More'
    }


    destroy() {
        this.eventBus.off('load.hasMore', this.listeners.removeBtn);
        this.eventBus.off('load.loading', this.listeners.removeBtn);

        this.moreBtn.removeEventListener('click', e => {
            this.requestMoreEvent()
        })
    }

}
