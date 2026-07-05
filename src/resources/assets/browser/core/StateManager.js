export default class StateManager {

    constructor({eventBus, initialState = {}} = {}) {
        this.eventBus = eventBus;

        this.initialState = {...this.getDefaultState(), ...initialState};

        this.state = structuredClone(this.initialState);
    }

    /**
     * Default state
     */
    getDefaultState() {
        return {
            cursor: null, loading: false, hasMore: true,

            disk: '', mimeType: '',

            selected: [], currentItem: null,

            upload: {
                active: 0, queue: 0, progress: 0
            }
        };
    }

    /**
     * Full state snapshot (safe)
     */
    getState() {
        return structuredClone(this.state);
    }

    /**
     * Get state key
     */
    get(key) {
        return this.state?.[key];
    }

    /**
     * Set value
     */
    set(key, value, silent = false) {

        const prev = this.state[key];

        this.state = {...this.state, [key]: value};

        if (!silent) {
            this.emit('state:changed', {key, value, prev, state: this.getState()});
        }
        return this;
    }

    /**
     * Patch multiple values
     */
    patch(partial = {}, silent = false) {

        const prevState = this.getState();

        this.state = {...this.state, ...partial};

        if (!silent) {
            this.emit('state:patched', {
                prev: prevState, state: this.getState()
            });
        }

        return this;
    }

    /**
     * Reset to initial state
     */
    reset() {

        this.state = structuredClone(this.initialState);

        this.emit('state:reset', this.getState());

        return this;
    }

    /**
     * Selection helpers
     */

    setSelected(items = []) {
        return this.set('selected', [...items]);
    }

    addSelected(item) {

        const selected = [...(this.state.selected || [])];

        const exists = selected.some(x => x.id === item.id);

        if (!exists) selected.push(item);


        return this.set('selected', selected);
    }

    removeSelected(id) {
        const selected = (this.state.selected || []).filter(x => x.id !== id);
        return this.set('selected', selected);
    }

    clearSelected() {
        return this.set('selected', []);
    }

    /**
     * Upload helpers
     */

    setUploadState(partial = {}) {
        return this.set('upload', {...this.state.upload, ...partial});
    }

    /**
     * Grid helpers
     */

    setCursor(cursor) {
        return this.set('cursor', cursor);
    }

    setLoading(value) {
        return this.set('loading', value);
    }

    setHasMore(value) {
        return this.set('hasMore', value);
    }

    /**
     * Safe event emit
     */

    emit(event, ...args) {


        if (!this.eventBus?.emit) return;

        try {
            this.eventBus.emit(event, ...args);
        } catch (error) {
            console.error('[StateManager Emit Error]', error);
        }
    }

    /**
     * Debug helper
     */

    debug() {
        console.table(this.state);
        return this.getState();
    }
}
