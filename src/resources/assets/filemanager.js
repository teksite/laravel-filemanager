class DatabaseFileManager {


    constructor(options = {}) {

        this.options = {
            defaultDisk: null,
            defaultMime: null,
            debounceTime: 300,
            ...options
        };

        this.state = {
            cursor: null,
            loading: false,
            hasMore: true,
            disk: '',
            mimeType: '',
            requestId: 0
        };

        this.uploadQueue = [];
        this.uploadActive = 0;
        this.uploadConcurrency = 3;

        this.selected = null;
        this.abortController = null;

        this.uploadFiles = [];

        this.selection = {
            enabled: false,
            mode: 'single',
            type: 'id',
            items: []
        };

        this.elements = {
            grid: document.querySelector('[data-grid]'),
            loader: document.querySelector('[data-loader]'),
            loadMore: document.querySelector('[data-load-more]'),
            mime: document.querySelector('[data-mimeList]'),
            disk: document.querySelector('[data-diskList]'),

            dropzone: document.querySelector('[data-dropzone]'),
            fileInput: document.querySelector('[data-file-input]'),
            uploadDisk: document.querySelector('[data-upload-disk]'),
            uploadPreview: document.querySelector('[data-upload-preview]'),
            uploadForm: document.querySelector('[data-upload-form]'),
            uploadMessages: document.querySelector('[data-upload-messages]')
        };

        // debounce timers
        this.debounceTimers = {
            filter: null
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

        const values = Array.from(select.options ?? []).map(o => o.value);

        if (preferred !== null) return values.includes(preferred) ? preferred : values[0] ?? '';
        if (values.includes('')) return '';

        return values[0] ?? '';
    }

    /* ================= DEBOUNCE ================= */

    debounce(fn, key, delay = this.options.debounceTime) {
        clearTimeout(this.debounceTimers[key]);
        this.debounceTimers[key] = setTimeout(fn, delay);
    }

    /* ================= EVENTS ================= */

    bindEvents() {

        // LOAD MORE (anti spam click)
        this.elements.loadMore?.addEventListener('click', (e) => {
            if (this.state.loading) return;

            this.elements.loadMore.disabled = true;

            this.load().finally(() => {
                this.elements.loadMore.disabled = false;
            });
        });

        // MIME (debounced)
        this.elements.mime?.addEventListener('change', ({ target }) => {
            this.state.mimeType = target.value;

            this.debounce(() => this.load(true), 'filter');
        });

        // DISK (debounced)
        this.elements.disk?.addEventListener('change', ({ target }) => {
            this.state.disk = target.value;

            this.debounce(() => this.load(true), 'filter');
        });

        this.bindUploader();
    }

    /* ================= LOAD ================= */

    async load(reset = false) {

        if (this.state.loading || (!reset && !this.state.hasMore)) return;

        // cancel previous request (VERY IMPORTANT)
        if (this.abortController) {
            this.abortController.abort();
        }

        this.abortController = new AbortController();

        const requestId = ++this.state.requestId;

        try {
            this.state.loading = true;
            this.toggleLoader(true);

            if (reset) this.resetGrid();

            const response = await fetch(
                `/api/filemanager?${this.buildQuery()}`,
                { signal: this.abortController.signal }
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            // prevent race condition rendering old response
            if (requestId !== this.state.requestId) return;

            this.updateState(data);
            this.renderGrid(data.files ?? []);

        } catch (error) {

            if (error.name !== 'AbortError') {
                console.error('[FileManager]', error);
            }

        } finally {
            this.state.loading = false;
            this.toggleLoader(false);
        }
    }

    buildQuery() {
        const query = new URLSearchParams();

        query.append('type', 'cursor');

        if (this.state.cursor) query.append('cursor', this.state.cursor);

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

        for (const item of items) {

            const card = document.createElement('div');
            card.className = 'media-card';
            card.dataset.id = item.id;

            card.innerHTML = `<div class="media-thumb">${this.renderItem(item)}</div>`;

            card.onclick = () => {
                this.selectItem(item);

                if (this.selection.enabled) {
                    this.toggleSelection(item, card);
                }
            };

            fragment.appendChild(card);
        }

        this.elements.grid.appendChild(fragment);
    }

    renderItem(item) {
        const type = item?.mime_type?.split('/')?.[0]?.toLowerCase();

        switch (type) {
            case 'image': return `<img src="${item.url}" loading="lazy">`;
            case 'video': return `<video src="${item.url}"></video>`;
            case 'audio': return `<audio src="${item.url}" controls></audio>`;
            default: return `<div>📄</div>`;
        }
    }

    /* ================= UTIL ================= */

    toggleLoader(show) {
        if (!this.elements.loader) return;
        this.elements.loader.style.display = show ? 'flex' : 'none';
    }

    formatSize(bytes) {
        if (!bytes) return '0 B';

        const units = ['B', 'KB', 'MB', 'GB'];
        let i = 0;

        while (bytes >= 1024 && i < units.length - 1) {
            bytes /= 1024;
            i++;
        }

        return `${bytes.toFixed(1)} ${units[i]}`;
    }

    /* ================= UPLOAD ================= */

    bindUploader() {
        const zone = this.elements.dropzone;
        const input = this.elements.fileInput;

        if (!zone || !input) return;

        zone.onclick = () => input.click();

        input.onchange = e => this.setFiles([...e.target.files]);

        ['dragenter', 'dragover'].forEach(ev =>
            zone.addEventListener(ev, e => {
                e.preventDefault();
                zone.classList.add('dragging');
            })
        );

        ['dragleave', 'drop'].forEach(ev =>
            zone.addEventListener(ev, () => zone.classList.remove('dragging'))
        );

        zone.addEventListener('drop', e => {
            e.preventDefault();
            this.setFiles([...e.dataTransfer.files]);
        });

        this.elements.uploadForm?.addEventListener('submit', e => {
            e.preventDefault();
            this.upload();
        });
    }

    setFiles(files = []) {
        this.uploadFiles = files;
        this.renderUploadPreview();
    }

    renderUploadPreview() {
        const container = this.elements.uploadPreview;
        container.innerHTML = '';

        for (const file of this.uploadFiles) {
            container.insertAdjacentHTML('beforeend', `
                <div class="upload-item">
                    <div>
                        ${file.name}
                        <div class="upload-progress">
                            <span data-progress="${file.name}"></span>
                        </div>
                    </div>
                    <small>${this.formatSize(file.size)}</small>
                </div>
            `);
        }
    }

    /* ================= LOAD MORE GUARD ================= */

    canLoadMore() {
        return !this.state.loading && this.state.hasMore;
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
                `/api/filemanager/${item.id}`,
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
                {method: 'DELETE'}
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

        ['id', 'title', 'url', 'size', 'mime', 'disk', 'created']
            .forEach(k => {
                const el = document.querySelector(`[data-${k}]`);
                if (el) el.textContent = '-';
            });
    }


    async upload() {

        this.clearUploadMessages();

        if (!this.uploadFiles.length) {
            this.showUploadMessage('Please select files first.', 'warning');
            return;
        }

        const disk = this.elements.uploadDisk?.value;

        this.uploadQueue = [...this.uploadFiles];
        this.uploadActive = 0;

        this.uploadSummary = {
            success: 0,
            failed: 0
        };

        return new Promise((resolve) => {

            const next = () => {

                if (this.uploadQueue.length === 0 && this.uploadActive === 0) {

                    // FINAL SYNC (only once)
                    this.load(true);

                    this.showUploadMessage(
                        `Upload done: ${this.uploadSummary.success} success`,
                        'success'
                    );

                    this.resetUploader();
                    resolve();
                    return;
                }

                while (
                    this.uploadActive < this.uploadConcurrency &&
                    this.uploadQueue.length > 0
                    ) {

                    const file = this.uploadQueue.shift();
                    this.uploadActive++;

                    const form = new FormData();
                    form.append('file', file);
                    form.append('disk', disk);

                    this.uploadSingle(file, form)
                        .then((serverItem) => {

                            this.uploadSummary.success++;

                            // 🔥 HYBRID UI UPDATE (NO FULL LOAD)
                            if (this.isUploadVisible(serverItem, disk, this.state.mimeType)) {
                                this.prependFiles([serverItem]);
                            }

                        })
                        .catch(() => {
                            this.uploadSummary.failed++;
                        })
                        .finally(() => {
                            this.uploadActive--;
                            next();
                        });
                }
            };

            next();
        });
    }


    isUploadVisible(item, disk, mimeType) {

        const currentDisk = this.state.disk;
        const currentMime = this.state.mimeType;

        const itemMimeGroup = item.mime_type?.split('/')?.[0];

        // ALL mode checks
        const diskAll = !currentDisk;
        const mimeAll = !currentMime;

        const diskMatch = diskAll || item.disk === currentDisk;
        const mimeMatch = mimeAll || itemMimeGroup === mimeType;

        return diskMatch && mimeMatch;
    }

    uploadSingle(file, form) {

        return new Promise((resolve, reject) => {

            const xhr = new XMLHttpRequest();

            xhr.open('POST', '/api/filemanager');

            xhr.upload.addEventListener('progress', e => {
                if (!e.lengthComputable) return;

                const percent = Math.round((e.loaded / e.total) * 100);

                const bar = document.querySelector(
                    `[data-progress="${file.name}"]`
                );

                if (bar) bar.style.width = `${percent}%`;
            });

            xhr.onload = () => {

                let response = {};

                try {
                    response = JSON.parse(xhr.responseText);
                } catch {}

                if (xhr.status >= 200 && xhr.status < 300) {
                    this.showUploadMessage(`${file.name} uploaded`, 'success');

                    // 🔥 IMPORTANT: return file object
                    resolve(response.data ?? response);
                    return;
                }

                reject();
            };

            xhr.onerror = () => reject();

            xhr.send(form);
        });
    }

    prependFiles(items = []) {

        const fragment = document.createDocumentFragment();

        for (const item of items) {

            const card = document.createElement('div');
            card.className = 'media-card';
            card.dataset.id = item.id;

            card.innerHTML = `
            <div class="media-thumb">
                ${this.renderItem(item)}
            </div>
        `;

            card.onclick = () => this.selectItem(item);

            fragment.appendChild(card);
        }

        this.elements.grid.prepend(fragment);
    }


    showUploadMessage(message, type = 'error') {

        const container = this.elements.uploadMessages;

        if (!container) return;

        const icons = {
            success: '✓',
            warning: '⚠',
            error: '✕'
        };

        const el = document.createElement('div');

        el.className = `upload-message ${type}`;

        el.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;

        container.prepend(el);
        setTimeout(() =>
            el.remove(), 6000
        );

    }

    resetUploader() {

        this.uploadFiles = [];

        if (this.elements.fileInput) {
            this.elements.fileInput.value = '';
        }
        if (this.elements.uploadPreview) {
            this.elements.uploadPreview.innerHTML = '';
        }

    }

    clearUploadMessages() {
        this.elements.uploadMessages?.replaceChildren();

    }

    /* ================= SELECT ================= */

    select(config = {}) {

        this.selection.enabled = true;

        this.selection.mode = ['single', 'multi'].includes(config.mode) ? config.mode : 'single';

        this.selection.type = ['id', 'url'].includes(config.type) ? config.type : 'id';

        this.selection.callback = config.onChoose || null;

        this.renderChooseButton();

        return this;
    }

    renderChooseButton() {

        const container = document.querySelector('.action-btns');
        if (!container) return;

        container.innerHTML = `<button type="button" class="choose-btn" data-choose> CHOOSE</button>`;

        container.querySelector('[data-choose]').onclick = () => {

            const data = this.selection.items.map(item =>
                this.selection.type === 'url' ? item.url : item.id);
            const result = this.selection.mode === 'single' ? (data[0] || null) : data;

            if (typeof this.selection.callback === 'function') {
                this.selection.callback(result);
            }

            console.log(result);

        };

    }


    toggleSelection(item, card) {

        const exists = this.selection.items.find(x => x.id === item.id);

        // remove
        if (exists) {
            this.selection.items = this.selection.items.filter(x => x.id !== item.id);

            card.classList.remove('selected');
            this.renderSelectedList();
            return;
        }


        // single

        if (this.selection.mode === 'single') {

            this.selection.items = [];

            document.querySelectorAll('.media-card.selected')
                .forEach(x => x.classList.remove('selected'));
        }

        this.selection.items.push(item);

        card.classList.add('selected');

        this.renderSelectedList();

    }

    renderSelectedList() {

        const container = document.querySelector('.selected-list');

        if (!container) return;

        container.innerHTML = '';

        this.selection.items.forEach(item => {

            const div = document.createElement('div');
            div.className = 'selected-item';
            div.innerHTML = `
                <div class="selected-thumb">
                    ${this.renderSmallPreview(item)}
                </div>
                <button data-remove="${item.id}" > × </button>`;


            div.querySelector('button').onclick = () => {
                this.removeSelection(item.id);
            }

            container.append(div);

        });

    }


    renderSmallPreview(item) {

        const type = item.mime_type?.split('/')?.[0];

        switch (type) {

            case 'image':
                return `<img src="${item.url}">`;

            case 'video':
                return `🎬`;

            case 'audio':
                return `🎵`;

            default:
                return `📄`;
        }
    }

    removeSelection(id) {
        this.selection.items = this.selection.items.filter(x => x.id !== id);

        const card = this.elements.grid.querySelector(`[data-id="${id}"]`);

        card?.classList.remove('selected');

        this.renderSelectedList();

    }
}
