export default function template() {

    return `
        <div class="fm-modal is-hidden" data-fm-modal>
            <div class="fm-overlay" data-fm-close></div>
            <div class="fm-window">
                <button class="fm-close" type="button" data-fm-close aria-label="Close">
                    ×
                </button>
                <div class="fm-body" data-fm-root ></div>
            </div>
        </div>
    `;

}
