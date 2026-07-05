const EVENTS = Object.freeze({

    /* File lifecycle */
    FILE_SELECTED: 'file:selected',
    FILE_DELETED: 'file:deleted',
    FILE_RENAMED: 'file:renamed',
    FILE_UPLOADED: 'file:uploaded',
    FILE_CHOOSE: 'file:choose',

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

    /* Upload */
    UPLOAD_SELECTED_REMOVE: 'upload:selected_remove',
    UPLOAD_SELECTED: 'upload:selected',
    UPLOAD_START: 'upload:start',
    UPLOAD_PROGRESS: 'upload:progress',
    UPLOAD_SUCCESS: 'upload:success',
    UPLOAD_FAILED: 'upload:failed',
    UPLOAD_COMPLETE: 'upload:complete',

    /* Filter */
    FILTER_CHANGED: 'filter:changed',

    /* Error */
    ERROR: 'error'

});

export default EVENTS;
