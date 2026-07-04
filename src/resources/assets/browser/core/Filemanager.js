import Config from "./Config.js";

export default class FileManager {
    constructor(config) {
        this.config = new Config(config)
        console.log(this.config)

    }


}
