import DatabaseFileManager from "./DatabaseFileManager.js";


export function initFileManager(config = {} ,onChoose) {

   return new DatabaseFileManager(config, onChoose);
}

export default initFileManager;
