import UiService from "../Foundation/UiService.js";
import Events from "../constants/events.js";


export default class MoreButtonUi extends UiService {

    defineElements() {

        return {
            moreBtn: this.config.get('ui.loadMoreSelector', '[data-load-more]')
        };
    }

    shouldInitialize() {

        return Boolean(this.moreBtn);
    }


    initialize() {

        this.primaryText = this.moreBtn.innerText;
    }


    busEvents() {

        return {

            'load.hasMore':
                ({value}) => {
                    this.toggleVisibility(value);
                },


            'load.loading':
                ({value}) => {
                    this.updateButton(value);
                }
        };
    }


    domEvents() {

        return [
            [
                this.moreBtn, 'click', this.requestMore
            ]
        ];
    }


    requestMore(e) {

        e.preventDefault();

        const isLoading = this.state.get('load.loading');

        const hasMore = this.state.get('load.hasMore');

        if (isLoading || !hasMore) return;

        this.eventBus.emit(Events.FILES_NEED_MORE, {action: 'click on button'});
    }

    toggleVisibility(value) {

        this.moreBtn.classList.toggle('is-hidden', !value);

        this.moreBtn.style.display = value
            ? 'inline-block'
            : 'none';
    }


    updateButton(value) {

        this.moreBtn.disabled = Boolean(value);


        if (value) {
            this.moreBtn.innerHTML = this.loadingTemplate();

            return;
        }

        this.moreBtn.textContent = this.primaryText;


    }

    loadingTemplate() {

        return `
        <svg  xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" style="display:block;margin:auto">
            <circle  cx="12" cy="12" r="10" stroke="#5996FF" stroke-width="3" opacity=".25"/>
            <path  d="M22 12a10 10 0 0 0-10-10" stroke="#293681" stroke-width="3" stroke-linecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
            </path
        </svg>
        `;
    }
}
