import DatabaseFileManager from "./core/DatabaseFileManager.js";


export function initFileManager(config = {} , root) {

    return new DatabaseFileManager(config , root);
}

export default initFileManager;
