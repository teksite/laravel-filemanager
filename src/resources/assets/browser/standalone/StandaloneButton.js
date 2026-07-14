export default class StandaloneButton {

    constructor(trigger = '[data-filemanager]') {
        const btnEls = document.querySelector(trigger);

        if (!btnEls) return;

        this.btn = btnEls;

        this.init()
    }

    init() {
        const configs = this.btn.getAttribute('data-config') ?? {}

        const overlay = document.createElement('dev')
        overlay.classList.add('filemanager' ,'overlay');


    }
}
