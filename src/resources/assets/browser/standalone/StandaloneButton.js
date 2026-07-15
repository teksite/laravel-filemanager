import * as url from "node:url";

export default class StandaloneButton {

    constructor(trigger = '[data-filemanager]') {

        this.trigger = trigger;

        this.bindEvents();
    }

    bindEvents() {

        this.clickHandler = this.clickHandler.bind(this);

        document.querySelectorAll(this.trigger).forEach(btn => {

            btn.addEventListener('click', this.clickHandler);
        });
    }

    async clickHandler(e) {

        e.preventDefault();

        const btn = e.currentTarget;

        let config = {};

        if (btn.dataset.config) {
            try {

                config = JSON.parse(btn.dataset.config);
            } catch (err) {

                console.warn('Invalid data-config JSON', err);
            }
        }

        let overlay = document.querySelector('.filemanager.overlay');

        if (!overlay) {

            overlay = document.createElement('div');

            overlay.className = 'filemanager overlay';

            document.body.appendChild(overlay);

            overlay.addEventListener('click', e => {
                overlay.remove()
            })
        }

        overlay.innerHTML = await this.fetchView(config);
    }

    async fetchView(config = {}) {

        const response = await fetch('/api/filemanager/browser', {
            method :'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: {
                config:{
                    selection: {
                        expect: 'url',
                        mode: 'single'
                    }
                }
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const prevent = (e) => {
            e.preventDefault();
            e.stopPropagation();
        }

        return `<div style="width: 90%" onClick="prevent">${await response.text()}</div>`;
    }

}
