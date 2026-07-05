const DEFAULTS = Object.freeze({

    /* Upload */
    uploadFiles : [],
    uploadConcurrency: 3,
    uploadEndpoint: '/api/filemanager',
    uploadChunkSize: 0, // reserved for future chunk upload
    uploadRetry: 0,



});

export default DEFAULTS;
