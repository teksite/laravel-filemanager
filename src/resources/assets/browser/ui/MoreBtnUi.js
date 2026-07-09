import {$} from "../helpers/dom.js";
import events from "../constants/events.js";

export default class MoreBtnUi {

    constructor({btnEl = null} = {}, eventBus, stateManager) {

        const selector = btnEl ?? '[data-load-more]';

        this.moreBtn = $(selector);

        if (!this.moreBtn) return;

        this.eventBus = eventBus;
        this.state = stateManager;

        this.listeners = {};

        this.bindDomEvents();
        this.bindBusEvents();
    }


    bindBusEvents() {

        this.listeners = {

            toggleVisibilityMorBtn: ({value}) => {
                this.toggleVisibilityMorBtn(value);
            },

            updateBtn: ({value}) => {
                this.updateBtn(value);
            }

        };

        this.eventBus.on('load.hasMore', this.listeners.toggleVisibilityMorBtn);
        this.eventBus.on('load.loading', this.listeners.updateBtn);
    }


    bindDomEvents() {

        this.clickHandler = (e) => {
            e.preventDefault();
            this.requestMore();
        };

        this.moreBtn.addEventListener('click', this.clickHandler);
    }


    requestMore() {

        const isLoading = this.state.get('load.loading');
        const hasMore = this.state.get('load.hasMore');

        if (isLoading || !hasMore) return;

        this.eventBus.emit(events.FILES_NEED_MORE, {action: 'click on button'});
    }


    toggleVisibilityMorBtn(value) {

        if (value) {
            this.moreBtn.style.display = 'inline-block';

            return
        }
        this.moreBtn.style.display = 'none';
    }


    updateBtn(value) {
        if (value) {
            this.moreBtn.disabled = true;
            this.moreBtn.innerText = 'loading ...';

            return;
        }


        this.moreBtn.disabled = false;
        this.moreBtn.innerText = 'Load More';
    }


    destroy() {

        this.eventBus.off('load.hasMore', this.listeners.removeBtn);

        this.eventBus.off('load.loading', this.listeners.updateBtn);

        this.moreBtn?.removeEventListener('click', this.clickHandler);
    }

}
