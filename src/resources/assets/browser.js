class DatabaseFileManager {
    constructor(options = {}) {
        this.options = {
            defaultDisk: null,
            defaultMime: null,
            ...options
        };
        this.state = {
            cursor: null,
            loading: false,
            hasMore: true,
            disk: '',
            mimeType: ''
        };
        this.elements = {
            grid: document.querySelector('[data-grid]'),
            loader: document.querySelector('[data-loader]'),
            loadMore: document.querySelector('[data-load-more]'),
            mime: document.querySelector('[data-mime]'),
            disk: document.querySelector('[data-disk]')
        };
        this.initialize();
    }

    initialize() {
        this.initializeDefaults();
        this.bindEvents();
        this.load(true);
    }

    initializeDefaults() {
        this.state.disk = this.resolveDefault(this.elements.disk, this.options.defaultDisk);
        this.state.mimeType = this.resolveDefault(this.elements.mime, this.options.defaultMime);

        this.elements.disk.value = this.state.disk;
        this.elements.mime.value = this.state.mimeType;

    }

    resolveDefault(select, preferred) {
        if (!select) return '';
        const options = Array.from(select.options ?? []);
        const values = options.map(option => option.value);


        if (preferred !== null) {
            return values.includes(preferred) ? preferred : values[0] ?? '';
        }

        if (values.includes('')) return '';

        return values[0] ?? '';
    }

    bindEvents() {
        this.elements.loadMore?.addEventListener('click', () => this.load());

        this.elements.mime?.addEventListener('change', ({target}) => {
            this.state.mimeType = target.value;
            this.load(true);
        });
        this.elements.disk?.addEventListener('change', ({target}) => {
            this.state.disk = target.value;
            this.load(true);
        });

    }

    async load(reset = false) {

        if (this.state.loading || (!reset && !this.state.hasMore)) return;
        try {
            this.state.loading = true;
            this.toggleLoader(true);

            if (reset) this.resetGrid();

            const response = await fetch(`/api/filemanager?${this.buildQuery()}`);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            this.updateState(data);

            this.renderGrid(data.files ?? []);

        } catch (error) {

            console.error('[FileManager]', error);
        } finally {
            this.state.loading = false;
            this.toggleLoader(false);
        }

    }

    buildQuery() {
        const query = new URLSearchParams();
        query.append('type', 'cursor');

        if (this.state.cursor) {
            query.append('cursor', this.state.cursor);
        }

        if (this.state.disk) {
            query.append('disk', this.state.disk);
        }

        if (this.state.mimeType) {
            query.append('mime_type', this.state.mimeType);
        }
        return query;

    }

    updateState(data) {

        this.state.cursor = data?.meta?.next_cursor ?? null;
        this.state.hasMore = data?.meta?.has_more ?? false;

        this.elements.loadMore.style.display = this.state.hasMore ? '' : 'none';
    }

    resetGrid() {

        this.state.cursor = null;
        this.state.hasMore = true;
        this.elements.grid.innerHTML = '';
    }

    renderGrid(items = []) {

        if (!items.length) return;

        const fragment = document.createDocumentFragment();

        items.forEach(item => {
            const card = document.createElement('div');

            card.className = 'media-card';

            card.innerHTML = `<div class="media-thumb">${this.renderItem(item)}</div> `;
            fragment.append(card);
        });

        this.elements.grid.append(fragment);
    }

    renderItem(item) {

        const type = item?.mime_type?.split('/')?.[0]?.toLowerCase();

        switch (type) {
            case 'image':
                return `<img src="${item.url}"loading="lazy">`;
            case 'video':
                return `<video src="${item.url}"></video>`;
            case 'audio':
                return ` <audiosrc="${item.url}"></audio>`;
            default: return `<div>📄</div>`;
        }

    }

    toggleLoader(show) {
        if (!this.elements.loader) return;
        this.elements.loader.style.display = show ? 'flex' : 'none';
    }

}
