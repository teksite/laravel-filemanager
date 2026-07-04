import FileManager from './DatabaseFileManager.js';

export function initFileManager(config = {}) {

    const fm = new DatabaseFileManager(config);
}

export default initFileManager;
