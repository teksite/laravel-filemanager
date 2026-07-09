import {$} from "../helpers/dom.js";
import events from "../constants/events.js";

export default class MoreBtnUi {

    constructor(elements = {}, eventBus, stateManager) {

        this.loadElements(elements)

        if (!this.moreBtn) return;

        this.state = stateManager;

        this.eventBus = eventBus;

        this.listeners = {};

        this.bindDomEvents();

        this.bindBusEvents();
    }

    loadElements(elements) {

        this.moreBtn = $(elements.btnEl ?? '[data-load-more]');

        this.primaryText =this.moreBtn?.innerText;

    }

    bindBusEvents() {

        this.listeners = {
            toggleVisibility: ({value}) => {

                this.toggleVisibility(value);
            },

            updateBtn: ({value}) => {

                this.updateBtn(value);
            }

        };

        this.eventBus.on('load.hasMore', this.listeners.toggleVisibility);

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


    toggleVisibility(value) {

        if (value) {
            this.moreBtn.style.display = 'inline-block';
            this.moreBtn.classList.remove('is-hidden');

            return
        }
        this.moreBtn.style.display = 'none';
        this.moreBtn.classList.add('is-hidden');
    }


    updateBtn(value) {
        if (value) {
            this.moreBtn.disabled = true;

            this.moreBtn.innerHTML = this.loadingEl();

            return;
        }


        this.moreBtn.disabled = false;

        this.moreBtn.textContent = this.primaryText
    }

    loadingEl(){
        return `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" style="display:block;margin:auto" >
    <circle cx="12" cy="12" r="10" stroke="#5996FF" stroke-width="3" opacity=".25" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke="#293681" stroke-width="3" stroke-linecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
    </path>
</svg>`
    }


    destroy() {

        this.eventBus.off('load.hasMore', this.listeners.toggleVisibility);

        this.eventBus.off('load.loading', this.listeners.updateBtn);

        this.moreBtn?.removeEventListener('click', this.clickHandler);
    }

}
