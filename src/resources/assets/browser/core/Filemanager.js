import Config from "./Config.js";
import EventEmitter from "./EventEmitter.js";

export default class FileManager {
    constructor(config) {
        this.config = new Config(config);
        const eventBus = new EventEmitter();
    }


}
