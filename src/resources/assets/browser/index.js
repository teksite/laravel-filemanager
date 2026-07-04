import FileManager from './core/FileManager.js';

export function initFileManager(config = {}) {

    const fm = new FileManager(config);
    fm.init();
    return fm;
}

export default initFileManager;
