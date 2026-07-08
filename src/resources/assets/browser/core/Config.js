const defaultConfig = {
    api: {
        baseUrl: '',
        getUrl: '/api/filemanager',
        uploadUrl: '/api/filemanager',

        deleteUrl: '/api/filemanager',
        updateUrl: '/api/filemanager',
    },

    request: {

        timeout: 15000,
        selectedDisk: null,
        selectedType: null,
        firstRequest: true
    },

    upload: {
        concurrency: 3,
        chunkSize: 0,
        requestTimeout: 15000,
        allowedMimes: [],
        allowedDisks: [],
    },

    load: {
        perPage: 25,
        cursorName: 'cursor',
        userId : null,

        selectedDisk: null,
        selectedType: null,
        getOnInit: true,
        loadingStyle: 'block' //overlay | block
    },

    log: {
        debug: false,
        toServer: true,
        serverUrl: null
    },


    selection: {
        mode: 'multi', //single: only one file | multi : multi file | null : disable
        expect: 'id'
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

        /* aside ui*/
        baseInfoSelector: '[data-aside]',
        filePreviewSelector: '[data-preview]',
        idInfoSelector: '[data-id]',
        titleInfoSelector: '[data-title]',
        urlInfoSelector: '[data-url]',
        sizeInfoSelector: '[data-size]',
        mimeInfoSelector: '[data-mime]',
        diskInfoSelector: '[data-disk]',
        createdInfoSelector: '[data-created]',
        deleteBtnSelector: '[data-delete]',
        openUrlBtnSelector: '[data-open]',
        copyUrlBtnSelector: '[data-copy]',

        /* footer */
        filesCounterSelector : '[data-file-counter]',
        selectionButtonSelector : '[data-actions-sec]',
        selectionGridSelector : '[data-selected-list]',

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

    get(path, defaultValue = null) {
        return this.getPath(path) ?? defaultValue;
    }

    section(key, defaultValue = []) {
        return this.config[key] ?? defaultValue;
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
