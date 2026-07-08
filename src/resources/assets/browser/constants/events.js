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
    FILES_REQUEST_FAILED: 'files:request_send_failed',
    FILES_RECEIVE: 'files:response_get',
    FILES_RECEIVE_FAILED: 'files:response_get_failed',

    FILES_NO_MORE: 'files:no_more',
    FILES_NEED_MORE: 'files:need_more',
    FILES_NEW: 'files:need_more',


    /* info */

    FILE_DELETE_SIGNAL: 'file:send_delete_signal',
    FILE_DELETED: 'file:send_deleted',
    FILE_DELETE_FAILED: 'file:delete_file_failed',
    FILE_SELECT:'file_selected',

    FILE_UPDATE_TITLE : 'file_update_title',
    FILE_UPDATED_TITLE : 'file_updated_title',
    FILE_UPDATE_FAILED : 'file_updated_title',



    /* Grid */
    GRID_UPDATED: 'grid:updated',
    GRID_CLEARED: 'grid:cleared',
    GRID_CLEAR: 'grid:clear',
    GRID_LOAD_START: 'grid:load:start',
    GRID_LOAD_END: 'grid:load:end',


    /* Selection */
    SELECTION_CLICK: 'selection:item_clicked',
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
