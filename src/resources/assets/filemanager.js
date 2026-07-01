class MediaManager {
    constructor(options = {}) {
        this.mode = options.mode ?? 'single';
        this.disks = options.disks ?? [];
        this.mimeTypes = options.mimes ?? [];
        this.onSelect = options.onSelect ?? (() => {
        });

        this.cursor = null;
        this.loading = false;
        this.hasMore = true;

        this.mimeType = '';
        this.disk = '';

        this.selected = [];

        this.abortController = null;

        this.overlay = null;
        this.container = null;
        this.grid = null;

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
            this.abortController?.abort();

            this.abortController = new AbortController();


            const query =
                new URLSearchParams({
                    type: 'cursor',
                    cursor: this.cursor || '',
                    mime_type: this.mimeType,
                    disk: this.disk
                });


            const response =
                await fetch(`/api/filemanager?${query}`,
                    {
                        signal:
                        this.abortController.signal
                    }
                );


            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            const files = data?.files ?? [];

            this.cursor = data?.meta?.next_cursor ?? null;

            this.hasMore = data?.meta?.has_more ?? false;

            this.renderGrid(files);

            this.loadMoreBtn.style.display = this.hasMore ? 'block' : 'none';

        } catch (error) {
            if (error.name === 'AbortError') return;

            console.error(error);
            this.showError('Failed loading media');

        } finally {
            this.loading = false;
            this.toggleLoader(false);
        }
    }


    renderGrid(items = []) {
        const fragment = document.createDocumentFragment();


        items.forEach(item => {
            const card = document.createElement('div');

            card.className = 'media-card';

            card.innerHTML = `<div class="media-thumb">${this.renderItem(item)}</div>`;

            card.onclick = () => {
                this.selectItem(item, card);
            };
            fragment.append(card);
        });
        this.grid.append(fragment);
    }


    selectItem(item, card) {

        if (this.mode === 'single') {
            this.grid.querySelectorAll('.media-card.selected')
                .forEach(
                    x => x.classList.remove('selected')
                );

            this.selected = [item];
            card.classList.add('selected');
        } else {

            card.classList.toggle('selected');

            const exists = this.selected.find(x => x.id === item.id);

            if (exists) {
                this.selected = this.selected.filter(x => x.id !== item.id);

            } else {
                this.selected.push(item);
            }

        }
        this.updatePreview(item);
    }


    updatePreview(item) {
        this.preview.innerHTML = this.renderItem(item);

        this.titleEl.textContent = item.title ?? '-';

        this.urlEl.textContent = item.url ?? '-';

        this.diskEl.textContent = item.disk ?? '-';
    }


    renderItem(item) {

        const type = item?.mime_type?.split('/')[0]?.toLowerCase();

        switch (type) {
            case 'image':
                return `<img src="${item.url}" alt="${item.title}" loading="lazy" >`;
            case 'video':
                return `<video src="${item.url}"></video>`;
            case 'audio':
                return `<audio src="${item.url}"></audio>`;
            default:
                return `<div style="display:flex;justify-content:center;align-items:center;height:100%;font-size:40px">📄</div>`;
        }

    }


    toggleLoader(show) {
        this.loader.style.display = show ? 'flex' : 'none';
    }


    showError(message) {
        alert(message);
    }

    close() {
        this.abortController?.abort();
        this.overlay?.remove();
    }

    renderPopup() {

        const diskOptions =
            this.disks
                .map(disk => `<option value="${disk}">${disk}</option>`)
                .join('');

        const mimeTypeOptions =
            this.mimeTypes
                .map(mimeType => `<option value="${mimeType}">${mimeType}</option>`)
                .join('');

        this.overlay = document.createElement('div');

        this.overlay.className = 'filemanager overlay';


        this.container = document.createElement('section');

        this.container.className = 'filemanager media-container';

        this.container.innerHTML = `
        <aside class="aside">
            <div class="preview-box">
                Select media
            </div>
            <div class="file-info">
                <h3>
                    File Info
                </h3>
                <div>
                    <b>Title</b>
                    <span class="title">
                        -
                    </span>
                </div>
                <div>
                    <b>URL</b>
                    <span class="url">
                        -
                    </span>
                </div>
                <div>
                    <b>Disk</b>
                    <span class="disk">
                        -
                    </span>
                </div>
            </div>
        </aside>

        <header class="header">
            <select class="mime-filter" id="mime-filter">
                  <option value="">
                    All mimes
                </option>
                ${mimeTypeOptions}
            </select>
            </select>

            <select class="disk-filter" id="disk-filter">
                <option value="">
                    All disks
                </option>
                ${diskOptions}
            </select>
        </header>

        <div class="media-grid"></div>

        <footer class="footer">
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
        <div id="loader"  style="display:none">
            Loading...
        </div>`;

        this.overlay.append(this.container);

        document.body.append(this.overlay);

        this.grid = this.container.querySelector('.media-grid');

        this.preview = this.container.querySelector('.preview-box');

        this.titleEl = this.container.querySelector('.title');

        this.urlEl = this.container.querySelector('.url');

        this.diskEl = this.container.querySelector('.disk');

        this.loader = this.container.querySelector('#loader');

        this.loadMoreBtn = this.container.querySelector('.load-more-btn');

        this.bindEvents();
    }

    bindEvents() {

        this.overlay.onclick = e => {
            if (e.target === this.overlay) {
                this.close();
            }
        };

        this.container.querySelector('.close-btn').onclick = () => this.close();

        this.loadMoreBtn.onclick = () => this.load();

        this.container.querySelector('.mime-filter').onchange = e => {
            this.mimeType = e.target.value;
            this.load(true);
        };

        this.container.querySelector('.disk-filter').onchange = e => {
            this.disk = e.target.value;
            this.load(true);
        };


        this.container.querySelector('.select-btn').onclick = () => {
            if (!this.selected.length) {
                this.showError('Select at least one file');
                return;
            }
            const result = this.mode === 'single' ? this.selected[0] : this.selected;

            this.onSelect(result);
            this.close();

        };

    }

}


document.getElementById('openMedia')?.addEventListener('click', () => {
        new MediaManager({
            mode: 'multi',
            disks: ['public' , 'local', 's3', 's3-arvan_private', 's3-arvan_public',],
            mimes: ['image', 'video', 'text'],
            onSelect: files => {
                console.log(files);
            }
        });

    }
);
