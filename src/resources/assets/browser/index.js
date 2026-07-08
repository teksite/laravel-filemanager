import DatabaseFileManager from "./DatabaseFileManager.js";


export function initFileManager(config = {}) {

   return new DatabaseFileManager(config);
}

export default initFileManager;
