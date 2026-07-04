import FileManager from './core/FileManager.js';

export function initFileManager(config = {}) {

    const fm = new FileManager(config);
    return fm;
}

export default initFileManager;
