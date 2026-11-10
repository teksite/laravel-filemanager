export default class StateManager {

    constructor(eventBus, initialState = {}) {
        this.eventBus = eventBus;

        this.initialState = {...this.getDefaultState(), ...initialState};

        this.state = structuredClone(this.initialState);
    }

    getDefaultState() {
        return {
            select: {
                current: null,
                files: {},
            },


            load: {
                files: {},
                append: {},
                prepend: {},

                loading: false,
                hasMore: true,

                cursor: null,
                disk: null,
                type: null,
                search: null,
                sort: '-created_at',
                folder: null,
                trashed: null,
            },

            upload: {
                active: 0,
                queue: 0,
                progress: 0,

                files: {},

                uploading: false,
                disk: null,
            },

            edit: {
                title: false
            }
        };
    }

    // -------------------------
    // Helpers
    // -------------------------

    getByPath(obj, path) {
        return path.split('.').reduce((acc, key) => acc?.[key], obj);
    }

    /**
     * Immutable update: only the objects along the path are copied, everything
     * else (e.g. the thousands of loaded files) is shared with the old state.
     */
    assoc(node, keys, value) {

        const [key, ...rest] = keys;

        const base = node !== null && typeof node === 'object' ? node : {};

        return {...base, [key]: rest.length ? this.assoc(base[key], rest, value) : value};
    }

    // -------------------------
    // State
    // -------------------------

    getState() {
        return structuredClone(this.state);
    }

    get(path, defaultValue = null) {
        return this.getByPath(this.state, path) ?? defaultValue;
    }

    set(path, value, dispatchEvent = true, silent = false) {

        const prev = this.get(path);

        this.state = this.assoc(this.state, path.split('.'), value);

        if (dispatchEvent && !silent) {
            this.emit(path, {value, prev}, {action: 'setState'});
        }

        if (!silent) {
            // The state tree is immutable, so listeners can keep this reference safely.
            this.emit('state:changed', {key: path, value, prev, state: this.state});
        }

        return this;
    }

    patch(partial = {}, silent = false) {

        const prevState = this.getState();

        this.state = {
            ...this.state,
            ...partial
        };

        if (!silent) {
            this.emit('state:patched', {prev: prevState, state: this.getState()});
        }

        return this;
    }

    emit(event, ...args) {
        if (!this.eventBus?.emit) return;
        try {
            this.eventBus.emit(event, ...args);
        } catch (error) {
            console.error(error);
        }
    }
}
