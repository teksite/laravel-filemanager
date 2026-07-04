import Config from "./core/Config.js";
import EventEmitter from "./core/EventEmitter.js";
import StateManager from "./core/StateManager.js";
import FileManager from "./core/Filemanager.js";

function createDatabaseFileManager(configs = {}) {

    const config = new Config(configs);

    const eventBus = new EventEmitter();

    const state = new StateManager({eventBus, initialState: {}});

    return new FileManager({
        config: config.get(),
        eventBus,
        state,
    });
}

/**
 * Auto-init helper (optional for Blade usage)
 */
export function initDatabaseFileManager(configs = {}) {

    const instance = createDatabaseFileManager(configs);

    instance.init?.();

    return instance;
}

/**
 * Default export for simple usage
 */
export default createFileManager;
