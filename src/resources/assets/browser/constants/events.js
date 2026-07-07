const EVENTS = Object.freeze({


    /* Upload */
    UPLOAD_SELECTED_REMOVE: 'upload:selected_remove',
    UPLOAD_SELECTED: 'upload:selected',
    UPLOAD_START: 'upload:start',
    UPLOAD_PROGRESS: 'upload:progress',
    UPLOAD_SUCCESS: 'upload:success',
    UPLOAD_FAILED: 'upload:failed',
    UPLOAD_COMPLETE: 'upload:complete',

    /* load */
    FILES_LOADED: 'files:loaded',
    FILES_REQUEST: 'files:request_send',
    FILES_RECEIVE: 'files:response_get',

    FILES_NO_MORE: 'files:no_more',
    FILES_NEED_MORE: 'files:need_more',
    FILES_NEW: 'files:need_more',




    /* Grid */
    GRID_UPDATED: 'grid:updated',
    GRID_RESET: 'grid:reset',
    GRID_LOAD_START: 'grid:load:start',
    GRID_LOAD_END: 'grid:load:end',

    /* Selection */
    SELECTION_CHANGED: 'selection:changed',
    SELECTION_CLEARED: 'selection:cleared',

    /* Preview */
    PREVIEW_UPDATED: 'preview:updated',
    PREVIEW_CLEARED: 'preview:cleared',


    /* Filter */
    FILTER_CHANGED: 'filter:changed',

    /* Error */
    ERROR: 'error'

});

export default EVENTS;
