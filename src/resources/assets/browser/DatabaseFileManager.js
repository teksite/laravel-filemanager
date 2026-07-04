import Config from "./core/Config.js";
import EventEmitter from "./core/EventEmitter.js";
import StateManager from "./core/StateManager.js";

function createDatabaseFileManager(config = {}) {

    const config = new Config(config);

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
