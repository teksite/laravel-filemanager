const EVENTS = Object.freeze({


    /* Upload */
    UPLOAD_SIGNAL: 'upload:selected_remove',
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


    FILE_UPDATE_TITLE_SIGNAL: 'file:send_update_title_signal',
    FILE_UPDATED_TITLE : 'file_updated_title',
    FILE_UPDATE_TITLE_FAILED : 'file_updated_title_failed',

    FILE_URL_COPIED : 'file_copied_url',
    FILE_URL_COPIED_FAILED : 'file_copy_url_failed',




    /* Grid */
    GRID_UPDATED: 'grid:updated',
    GRID_CLEARED: 'grid:cleared',
    GRID_CLEAR: 'grid:clear',
    GRID_LOAD_START: 'grid:load:start',
    GRID_LOAD_END: 'grid:load:end',


    /* Selection */
    SELECTION_CLICK: 'selection:item_clicked',
    SELECTION_REMOVE_SIGNAL: 'selection:item_remove_signal',
    SELECTION_REMOVED: 'selection:item_remove',
    SELECTION_CHANGED: 'selection:changed',
    SELECTION_CLEARED: 'selection:cleared',
    SELECTION_ON_CHOOSE: 'selection:return_selected_files',
    SELECTION_CHOSEN: 'selection:return_selected_files',

    SELECTION_SELECT_BUTTON_MADE : 'selection:make_button',




    /* Preview */
    PREVIEW_UPDATED: 'preview:updated',
    PREVIEW_CLEARED: 'preview:cleared',


    /* Filter */
    FILTER_CHANGED: 'filter:changed',

    /* Error */

    CHOOSE: 'choose',
    UPLOAD: 'upload',
    DELETE: 'delete',
    UPDATE: 'update',
    ERROR: 'error',

});

export default EVENTS;
