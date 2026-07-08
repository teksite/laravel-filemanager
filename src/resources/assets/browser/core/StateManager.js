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
                files: null,
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
            },

            upload: {
                active: 0,
                queue: 0,
                progress: 0,
                files: [],
                uploading: false
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

    setByPath(obj, path, value) {

        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (
                current[key] === undefined ||
                typeof current[key] !== 'object'
            ) {
                current[key] = {};
            }

            current = current[key];
        }

        current[keys.at(-1)] = value;

        return obj;
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

        const newState = structuredClone(this.state);

        this.setByPath(newState, path, value);

        this.state = newState;

        if (dispatchEvent && !silent) {
            this.emit(path, {value, prev}, {action: 'setState'});
        }

        if (!silent) {
            this.emit('state:changed', {key: path, value, prev, state: this.getState()});
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
