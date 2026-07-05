const DEFAULTS = Object.freeze({

    /* General */
    defaultDisk: null,
    defaultMime: null,

    /* Network */
    debounceTime: 300,
    requestTimeout: 15000,

    /* Pagination / loading */
    cursorParam: 'cursor',
    paginationType: 'cursor',

    /* Upload */
    uploadConcurrency: 3,
    uploadEndpoint: '/api/filemanager',
    uploadChunkSize: 0, // reserved for future chunk upload
    uploadRetry: 0,

    /* Selection */
    selection: {
        enabled: false,
        mode: 'single', // single | multi
        type: 'id'       // id | url
    },

    /* UI */
    autoLoad: true,
    showLoader: true,
    showLoadMore: true,

    /* Grid */
    gridSelector: '[data-grid]',
    loadMoreSelector: '[data-load-more]',
    loaderSelector: '[data-loader]',

    /* Filters */
    diskSelector: '[data-diskList]',
    mimeSelector: '[data-mimeList]',

    /* Upload UI */
    dropzoneSelector: '[data-dropzone]',
    fileInputSelector: '[data-file-input]',
    uploadPreviewSelector: '[data-upload-preview]',
    uploadFormSelector: '[data-upload-form]',
    uploadDiskSelector: '[data-upload-disk]',
    uploadMessagesSelector: '[data-messages]',

    /* Preview */
    previewSelector: '[data-preview]',

    /* Info panel */
    infoSelectors: {
        id: '[data-id]',
        title: '[data-title]',
        size: '[data-size]',
        mime: '[data-mime]',
        disk: '[data-disk]',
        created: '[data-created]',
        url: '[data-url]'
    },

    /* Performance */
    renderBatchSize: 30,
    useDocumentFragment: true,

    /* Safety */
    confirmDelete: true,

    /* Debug */
    debug: false

});

export default DEFAULTS;
