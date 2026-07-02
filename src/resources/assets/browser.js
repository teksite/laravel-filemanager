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

        this.selected = null;

        this.elements = {
            grid: document.querySelector('[data-grid]'),
            loader: document.querySelector('[data-loader]'),
            loadMore: document.querySelector('[data-load-more]'),
            mime: document.querySelector('[data-mimeList]'),
            disk: document.querySelector('[data-diskList]')
        };

        this.initialize();
    }

    /* ================= INIT ================= */

    initialize() {
        this.initializeDefaults();
        this.bindEvents();
        this.load(true);
    }

    initializeDefaults() {

        this.state.disk = this.resolveDefault(this.elements.disk, this.options.defaultDisk);

        this.state.mimeType = this.resolveDefault(this.elements.mime, this.options.defaultMime);

        if (this.elements.disk?.querySelector(`option[value="${this.state.disk}"]`)) {
            this.elements.disk.value = this.state.disk;
        }

        if (this.elements.mime?.querySelector(`option[value="${this.state.mimeType}"]`)) {
            this.elements.mime.value = this.state.mimeType;
        }
    }

    resolveDefault(select, preferred) {

        if (!select) return '';

        const options = Array.from(select.options ?? []);
        const values = options.map(o => o.value);

        if (preferred !== null) {
            return values.includes(preferred) ? preferred : values[0] ?? '';
        }

        if (values.includes('')) return '';

        return values[0] ?? '';
    }

    /* ================= EVENTS ================= */

    bindEvents() {
        this.elements.loadMore?.addEventListener('click', () => this.load());

        this.elements.mime?.addEventListener('change', ({ target }) => {
            this.state.mimeType = target.value;
            this.load(true);
        });

        this.elements.disk?.addEventListener('change', ({ target }) => {
            this.state.disk = target.value;
            this.load(true);
        });
    }

    /* ================= LOAD ================= */

    async load(reset = false) {

        if (this.state.loading || (!reset && !this.state.hasMore)) return;

        try {
            this.state.loading = true;
            this.toggleLoader(true);

            if (reset) this.resetGrid();

            const response = await fetch(
                `/api/filemanager?${this.buildQuery()}`
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

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

        query.append('disk', this.state.disk ?? '');
        query.append('mime_type', this.state.mimeType ?? '');

        return query;
    }

    updateState(data) {

        this.state.cursor = data?.meta?.next_cursor ?? null;
        this.state.hasMore = data?.meta?.has_more ?? false;

        if (this.elements.loadMore) {
            this.elements.loadMore.style.display = this.state.hasMore ? '' : 'none';
        }
    }

    resetGrid() {
        this.state.cursor = null;
        this.state.hasMore = true;
        this.elements.grid.innerHTML = '';
    }

    /* ================= GRID ================= */

    renderGrid(items = []) {

        if (!items.length) return;

        const fragment = document.createDocumentFragment();

        items.forEach(item => {

            const card = document.createElement('div');

            card.className = 'media-card';
            card.dataset.id = item.id;

            card.innerHTML = `<div class="media-thumb">${this.renderItem(item)}</div>`;

            card.addEventListener('click', () => this.selectItem(item));

            fragment.appendChild(card);
        });

        this.elements.grid.appendChild(fragment);
    }

    renderItem(item) {

        const type = item?.mime_type?.split('/')?.[0]?.toLowerCase();

        switch (type) {

            case 'image':
                return `<img src="${item.url}" loading="lazy">`;

            case 'video':
                return `<video src="${item.url}"></video>`;

            case 'audio':
                return `<audio src="${item.url}" controls></audio>`;

            default:
                return `<div>📄</div>`;
        }
    }

    /* ================= SELECT ================= */

    selectItem(item) {
        this.selected = item;
        this.renderPreview(item);
        this.renderInfo(item);
    }

    /* ================= PREVIEW ================= */

    renderPreview(item) {

        const box = document.querySelector('[data-preview]');
        if (!box) return;

        const type = item.mime_type?.split('/')[0];

        switch (type) {

            case 'image':
                box.innerHTML = `<img src="${item.url}" />`;
                break;

            case 'video':
                box.innerHTML = `<video controls src="${item.url}"></video>`;
                break;

            case 'audio':
                box.innerHTML = `<audio controls src="${item.url}"></audio>`;
                break;

            default:
                box.innerHTML = `<div>📄</div>`;
        }
    }

    /* ================= INFO ================= */

    renderInfo(item) {

        const set = (key, value) => {
            const el = document.querySelector(`[data-${key}]`);
            if (el) el.textContent = value ?? '-';
        };

        set('id', item.id);
        set('title', item.title || item.original_name);
        set('size', this.formatSize(item.size));
        set('mime', item.mime_type);
        set('disk', item.disk);
        set('created', new Date(item.created_at).toLocaleString());

        const urlEl = document.querySelector('[data-url]');
        if (urlEl) urlEl.textContent = item.url;

        this.bindActions(item);

        this.enableTitleEdit(item);
    }

    bindActions(item) {

        const openBtn = document.querySelector('[data-open]');
        const copyBtn = document.querySelector('[data-copy]');
        const deleteBtn = document.querySelector('[data-delete]');

        if (openBtn) {
            openBtn.onclick = () => window.open(item.url, '_blank');
        }

        if (copyBtn) {
            copyBtn.onclick = async () => {
                await navigator.clipboard.writeText(item.url);
                copyBtn.textContent = '✓';

                setTimeout(() => copyBtn.textContent = '📋', 1000);
            };
        }

        if (deleteBtn) {
            deleteBtn.onclick = () => this.deleteItem(item);
        }
    }

    /* ================= TITLE EDIT (DOUBLE CLICK) ================= */

    enableTitleEdit(item) {

        const el = document.querySelector('[data-title]');
        if (!el) return;

        el.ondblclick = () => {

            const oldValue = item.title || item.original_name;

            const input = document.createElement('input');
            input.value = oldValue;
            input.className = 'title-edit-input';

            el.replaceWith(input);
            input.focus();
            input.select();

            const save = async () => {

                const newValue = input.value.trim();

                const finalValue = newValue || oldValue;

                await this.updateTitle(item, finalValue);

                const span = document.createElement('span');
                span.setAttribute('data-title', '');
                span.textContent = finalValue;

                input.replaceWith(span);

                this.enableTitleEdit({
                    ...item,
                    title: finalValue
                });
            };

            input.addEventListener('keydown', (e) => {

                if (e.key === 'Enter') input.blur();

                if (e.key === 'Escape') {
                    input.value = oldValue;
                    input.blur();
                }
            });

            input.addEventListener('blur', save);
        };
    }

    async updateTitle(item, newTitle) {

        if (!newTitle || newTitle === item.title) return;

        try {

            const res = await fetch(
                `/api/filemanager/${item.id}/rename`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: newTitle
                    })
                }
            );

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            if (this.selected?.id === item.id) {
                this.selected.title = newTitle;
            }

        } catch (err) {
            console.error('[RENAME ERROR]', err);
        }
    }

    /* ================= DELETE ================= */

    async deleteItem(item) {

        if (!confirm('Delete this file?')) return;

        try {

            const res = await fetch(
                `/api/filemanager/${item.id}`,
                { method: 'DELETE' }
            );

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            this.removeFromGrid(item.id);

            if (this.selected?.id === item.id) {
                this.clearPreview();
            }

        } catch (err) {
            console.error('[DELETE ERROR]', err);
        }
    }

    removeFromGrid(id) {
        const card = this.elements.grid.querySelector(`[data-id="${id}"]`);
        if (card) card.remove();
    }

    clearPreview() {

        this.selected = null;

        const box = document.querySelector('[data-preview]');
        if (box) box.innerHTML = 'Select media';

        ['id','title','url','size','mime','disk','created']
            .forEach(k => {
                const el = document.querySelector(`[data-${k}]`);
                if (el) el.textContent = '-';
            });
    }

    /* ================= UTIL ================= */

    formatSize(bytes) {

        if (!bytes) return '0 B';

        const units = ['B','KB','MB','GB'];

        let i = 0;

        while (bytes >= 1024 && i < units.length - 1) {
            bytes /= 1024;
            i++;
        }

        return `${bytes.toFixed(1)} ${units[i]}`;
    }

    toggleLoader(show) {

        if (!this.elements.loader) return;

        this.elements.loader.style.display =
            show ? 'flex' : 'none';
    }
}
