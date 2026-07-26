import DatabaseFileManager from "./core/DatabaseFileManager.js";
import StandaloneButton from "./Picker/StandaloneButton.js";


export function initFileManager(config = {} , root) {

    return new DatabaseFileManager({config, root});
}

export function Standalone(trigger , config={}) {

    return new StandaloneButton(trigger,config)
}


export default {
    initFileManager,
    Standalone,
};
