const defaultConfig = {
    api: {
        baseUrl: '',
        getUrl: '/api/filemanager',
        uploadUrl: '/api/filemanager',

        deleteUrl: '/api/filemanager',
        updateUrl: '/api/filemanager',
    },


    upload: {
        concurrency: 3,
        chunkSize: 0,
        requestTimeout: 15000,
        allowedMimes: [],
        allowedDisks: [],
    },

    load: {
        perPage: 50,
        cursorName: 'cursor',
        selectedDisk : null,
        selectedType : null,
        getOnInit :true
    },
    request: {

        timeout: 15000,
        selectedDisk : null,
        selectedType : null,
        firstRequest :true
    },

    log:{
        debug: false,
        toServer : true,
        serverUrl : null
    },



    selection: {
        enable: false,
        mode: 'single',
        type: 'id'
    },

    debounce: {
        delay: 300
    },

    ui: {
        mainSelector: '.filemanager',

        /* loader ui*/
        gridSelector: '[data-grid]',
        loadingSelector: '[data-loading]',
        loadMoreSelector: '[data-load-more]',
        mimesSelector: '[data-mimeList]',
        disksSelector: '[data-diskList]',

        /* uploader ui*/
        uploadFormSelector: '[data-upload-form]',
        dropzoneSelector: '[data-dropzone]',
        fileInputSelector: '[data-file-input]',
        uploadDiskSelector: '[data-upload-disk]',
        uploadPreviewSelector: '[data-upload-preview]',
        uploadMessagesSelector: '[data-messages]',
    }
};

export default class Config {

    constructor(configs = {}) {
        this.config = this.deepFreeze(
            this.deepMerge(
                structuredClone(defaultConfig),
                configs
            )
        );
    }

    all() {
        return this.config;
    }

    get(path , alternative =null) {
        return this.getPath(path) ?? alternative;
    }

    section(key) {
        return this.config[key] ?? null;
    }

    clone() {
        return structuredClone(this.config);
    }

    getPath(path = '') {
        if (!path) return undefined;
        return path
            .split('.')
            .reduce((obj, key) => obj?.[key], this.config);
    }

    deepMerge(target, source) {

        if (!this.isObject(source)) {
            return source ?? target;
        }

        Object.keys(source).forEach(key => {

            const sourceValue = source[key];
            const targetValue = target[key];

            if (sourceValue == null) {
                return;
            }

            if (
                this.isObject(sourceValue) &&
                this.isObject(targetValue)
            ) {
                target[key] = this.deepMerge(
                    targetValue,
                    sourceValue
                );
            } else {
                target[key] = sourceValue;
            }

        });

        return target;
    }

    isObject(value) {
        return (value !== null && typeof value === 'object' && !Array.isArray(value));
    }

    deepFreeze(obj) {
        Object.keys(obj).forEach(key => {

            if (this.isObject(obj[key])) {
                this.deepFreeze(obj[key]);
            }

        });

        return Object.freeze(obj);
    }
}
