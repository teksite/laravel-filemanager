class MediaManager {

    constructor(options = {}) {

        this.mode = options.mode ?? 'single';

        this.cursor = null;
        this.loading = false;
        this.hasMore = true;

        this.mimeType = null;
        this.disk = null;

        this.selected = [];

        this.container = null;
        this.grid = null;
        this.overlay = null;

        this.abortController = null;

        this.init();
    }


    async init() {
        this.renderPopup();
        await this.load();
    }


    async load(reset = false) {

        if (this.loading) return;

        try {
            this.loading = true;
            this.toggleLoader(true);

            if (reset) {
                this.cursor = null;
                this.hasMore = true;
                this.grid.innerHTML = '';
            }

            if (!this.hasMore) return;

            if (this.abortController) {
                this.abortController.abort();
            }

            this.abortController = new AbortController();


            const query = new URLSearchParams({
                type: 'cursor',
                cursor: this.cursor || '',
                mime_type: this.mimeType || '',
                disk: this.disk || ''
            });


            const response = await fetch(
                `/api/filemanager?${query}`,
                {
                    signal: this.abortController.signal
                }
            );


            if (!response.ok) {
                throw new Error(`Request failed (${response.status})`);
            }


            const data = await response.json();

            const files = data?.files ?? [];

            this.cursor = data?.meta?.next_cursor ?? null;

            this.hasMore = data?.meta?.has_more ?? false;

            this.renderGrid(files);

            this.updateLoadButton();

        } catch (error) {
            if (error.name === "AbortError") {
                return;
            }

            console.error('MediaManager Error:', error);

            this.showError('Failed to load media files');
        } finally {

            this.loading = false;
            this.toggleLoader(false);
        }

    }

    renderGrid(items = []) {
        const fragment = document.createDocumentFragment();

        items.forEach(item => {
            const card = this.createMediaCard(item);
            fragment.appendChild(card);
        });
        this.grid.appendChild(fragment);
    }


    createMediaCard(item) {

        const card = document.createElement('div');
        card.className = 'media-card';
        card.innerHTML = `<div class="media-thumb">${this.renderItem(item)}</div>`;
        card.addEventListener('click', () => this.selectItem(item, card));

        return card;

    }


    selectItem(item, element) {

        if (this.mode === "single") {
            this.grid.querySelectorAll('.media-card.selected')
                .forEach(x => x.classList.remove('selected'));

            this.selected = [item];

            element.classList.add('selected');
        } else {

            element.classList.toggle(
                'selected'
            );

            const exists =
                this.selected.find(
                    x => x.id === item.id
                );

            if (exists) {

                this.selected =
                    this.selected.filter(
                        x => x.id !== item.id
                    );

            } else {

                this.selected.push(
                    item
                );
            }

        }

        this.updatePreview(item);

    }


    updatePreview(item) {

        this.preview.innerHTML =
            this.renderItem(item);

        this.titleEl.textContent =
            item.title || '-';

        this.urlEl.textContent =
            item.url || '-';

        this.diskEl.textContent =
            item.disk || '-';

    }


    renderItem(item) {

        const type =
            item?.mime_type
                ?.split('/')[0]
                ?.toLowerCase();


        switch (type) {

            case 'image':

                return `
                    <img
                        src="${item.url}"
                        alt="${item.title}"
                        loading="lazy"
                    >
                `;


            case 'video':

                return `
                    <video
                        src="${item.url}"
                    ></video>
                `;


            case 'audio':

                return `
                    <svg viewBox="0 0 24 24">
                        <path d="M12 3v18"/>
                    </svg>
                `;


            case 'text':

                return `
                    <svg viewBox="0 0 24 24">
                        <path d="M6 6h12"/>
                    </svg>
                `;

            default:

                return `
                    <svg viewBox="0 0 24 24">
                        <path d="M5 5h14v14H5z"/>
                    </svg>
                `;
        }

    }


    updateLoadButton() {

        this.loadMoreBtn.style.display =
            this.hasMore
                ? 'block'
                : 'none';

    }


    toggleLoader(show) {

        this.loader.style.display =
            show
                ? 'flex'
                : 'none';

    }


    showError(message) {

        const div =
            document.createElement('div');

        div.className =
            'media-error';

        div.textContent =
            message;

        this.grid.prepend(div);

        setTimeout(() => {
            div.remove();
        }, 3000);

    }


    close() {

        this.abortController?.abort();

        this.overlay.remove();

    }


    renderPopup() {

        this.overlay =
            document.createElement(
                'div'
            );

        this.overlay.className =
            'filemanager overlay';


        this.container =
            document.createElement(
                'section'
            );

        this.container.className =
            'filemanager media-container';


        this.container.innerHTML = `

        <aside class="filemanager aside">

            <div class="preview-box">
                Select media
            </div>

            <div class="file-info">

                <h3>
                    File Info
                </h3>

                <div>
                    <b>title:</b>
                    <span class="title">-</span>
                </div>

                <div>
                    <b>url:</b>
                    <span class="url">-</span>
                </div>

                <div>
                    <b>disk:</b>
                    <span class="disk">-</span>
                </div>

            </div>

        </aside>


        <header class="filemanager header">

            <select class="mime-filter">
                <option value="">
                    All Types
                </option>

                <option value="image">
                    Images
                </option>

                <option value="video">
                    Videos
                </option>

                <option value="audio">
                    Audio
                </option>

            </select>

        </header>


        <div class="media-grid"></div>


        <footer class="filemanager footer">

            <div>

                <button class="close-btn">
                    Close
                </button>

                <button class="load-more-btn">
                    Load More
                </button>

            </div>


            <button class="select-btn">
                Select
            </button>

        </footer>


        <div
            id="loader"
            style="display:none"
        >
            Loading...
        </div>

        `;


        this.overlay.appendChild(
            this.container
        );

        document.body.appendChild(
            this.overlay
        );


        this.grid =
            this.container.querySelector(
                '.media-grid'
            );

        this.preview =
            this.container.querySelector(
                '.preview-box'
            );

        this.titleEl =
            this.container.querySelector(
                '.title'
            );

        this.urlEl =
            this.container.querySelector(
                '.url'
            );

        this.diskEl =
            this.container.querySelector(
                '.disk'
            );

        this.loader =
            this.container.querySelector(
                '#loader'
            );

        this.loadMoreBtn =
            this.container.querySelector(
                '.load-more-btn'
            );


        this.bindEvents();

    }


    bindEvents() {

        this.overlay.addEventListener(
            'click',
            e => {

                if (
                    e.target === this.overlay
                ) {
                    this.close();
                }

            }
        );


        this.container
            .querySelector(
                '.close-btn'
            )
            .addEventListener(
                'click',
                () => this.close()
            );


        this.loadMoreBtn
            .addEventListener(
                'click',
                () => this.load()
            );


        this.container
            .querySelector(
                '.mime-filter'
            )
            .addEventListener(
                'change',
                e => {

                    this.mimeType =
                        e.target.value;

                    this.load(true);

                }
            );

    }

}


const openButton =
    document.getElementById(
        'openMedia'
    );

if (openButton) {

    openButton.addEventListener(
        'click',
        e => {

            e.preventDefault();

            new MediaManager({
                mode: 'multi'
            });

        }
    );

}
