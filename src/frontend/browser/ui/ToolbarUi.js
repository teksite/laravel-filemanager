import UiService from "../Foundation/UiService.js";
import debounce from "../helpers/debounce.js";

/**
 * Search, sorting, folders and trash controls of the header / sidebar.
 * Every control is optional: when its element is missing from a custom view the
 * feature is simply skipped.
 */
export default class ToolbarUi extends UiService {

    defineElements() {

        return {
            searchEl: '[data-search]',
            sortEl: '[data-sort]',
            folderEl: '[data-folder-list]',
            newFolderEl: '[data-folder-create]',
            trashEl: '[data-trash-toggle]',
            restoreEl: '[data-restore]',
            moveEl: '[data-move-folder]',
        };
    }

    shouldInitialize() {

        return Boolean(this.searchEl || this.sortEl || this.folderEl || this.trashEl);
    }

    initialize() {

        this.folders = [];

        this.applySearch = debounce(value => this.state.set('load.search', value || null), this.config.get('debounce.delay', 300));

        this.loadFolders();
    }

    busEvents() {

        return {
            'select.current': ({value}) => this.syncSelection(value),
        };
    }

    domEvents() {

        return [
            [this.searchEl, 'input', event => this.applySearch(event.target.value.trim())],
            [this.sortEl, 'change', event => this.state.set('load.sort', event.target.value || null)],
            [this.folderEl, 'change', event => this.state.set('load.folder', event.target.value || null)],
            [this.newFolderEl, 'click', this.createFolder],
            [this.trashEl, 'click', this.toggleTrash],
            [this.restoreEl, 'click', this.restoreCurrent],
            [this.moveEl, 'change', this.moveCurrent],
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Folders
    |--------------------------------------------------------------------------
    */

    async loadFolders() {

        if (!this.folderEl && !this.moveEl) return;

        const {data} = await this.safe(() => this.request.getFolders());

        this.folders = data?.folders ?? [];

        this.renderFolderOptions();
    }

    /** Flat list ordered as a tree, indented by depth. Text is set via DOM APIs, never as HTML. */
    orderedFolders() {

        const byParent = new Map();

        this.folders.forEach(folder => {

            const key = folder.parent_id ?? '';

            byParent.set(key, [...(byParent.get(key) ?? []), folder]);
        });

        const walk = (parentId, depth) => (byParent.get(parentId) ?? [])
            .flatMap(folder => [{folder, depth}, ...walk(folder.id, depth + 1)]);

        return walk('', 0);
    }

    renderFolderOptions() {

        const ordered = this.orderedFolders();

        const build = (select, firstOptions) => {

            if (!select) return;

            const current = select.value;

            select.replaceChildren(...firstOptions.map(([value, label]) => new Option(label, value)));

            ordered.forEach(({folder, depth}) => {
                select.append(new Option(`${'\u00A0\u00A0'.repeat(depth)}📁 ${folder.name}`, folder.id));
            });

            select.value = [...select.options].some(option => option.value === current) ? current : select.options[0].value;
        };

        build(this.folderEl, [['', this.label('allFolders', 'All files')], ['root', this.label('rootFolder', 'Without folder')]]);

        build(this.moveEl, [['root', this.label('rootFolder', 'Without folder')]]);
    }

    label(key, fallback) {

        return this.folderEl?.dataset[key] ?? fallback;
    }

    async createFolder() {

        const name = prompt(this.newFolderEl.dataset.prompt ?? 'Folder name')?.trim();

        if (!name) return;

        const current = this.state.get('load.folder', null);

        const parent = current && current !== 'root' ? current : null;

        const {success, error} = await this.safe(() => this.request.createFolder(name, parent), error => this.errorBus?.emit?.(error));

        if (!success) {
            alert(error?.message ?? 'Failed to create the folder.');

            return;
        }

        await this.loadFolders();
    }

    /*
    |--------------------------------------------------------------------------
    | Trash & moving
    |--------------------------------------------------------------------------
    */

    toggleTrash() {

        const active = this.state.get('load.trashed') !== 'only';

        this.state.set('load.trashed', active ? 'only' : null);

        this.trashEl.classList.toggle('is-active', active);

        this.trashEl.setAttribute('aria-pressed', String(active));

        this.restoreEl?.classList.toggle('is-hidden', !active);

        this.moveEl?.closest('[data-move-box]')?.classList.toggle('is-hidden', active);
    }

    syncSelection(fileId) {

        const file = fileId ? this.state.get('load.files', {})[fileId] : null;

        if (this.restoreEl) this.restoreEl.disabled = !file;

        if (this.moveEl) {

            this.moveEl.disabled = !file;

            this.moveEl.value = file?.folder_id ?? 'root';
        }
    }

    async restoreCurrent() {

        const id = this.state.get('select.current');

        if (!id) return;

        const {success} = await this.safe(() => this.request.restoreFile(id), error => this.errorBus?.emit?.(error));

        if (success) this.eventBus.emit('files:reload');
    }

    async moveCurrent(event) {

        const id = this.state.get('select.current');

        if (!id) return;

        const folderId = event.target.value === 'root' ? null : event.target.value;

        const {success} = await this.safe(() => this.request.moveFile(id, folderId), error => this.errorBus?.emit?.(error));

        if (success) this.eventBus.emit('files:reload');
    }
}
