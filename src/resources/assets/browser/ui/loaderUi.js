export default class LoaderUI {
    constructor(elements = {}) {
        this.elements = {
            loader: elements.loader || document.querySelector('[data-loader]')
        };
    }

    /**
     * Show or hide loader
     * @param {boolean} show
     */
    toggle(show = false) {
        if (!this.elements.loader) return;

        this.elements.loader.style.display = show ? 'flex' : 'none';
    }

    /**
     * Force show loader
     */
    show() {
        this.toggle(true);
    }

    /**
     * Force hide loader
     */
    hide() {
        this.toggle(false);
    }

    /**
     * Replace loader element dynamically (useful for re-init)
     */
    setLoaderElement(el) {
        this.elements.loader = el;
    }
}
