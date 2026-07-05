import Config from "./core/Config.js";
import EventEmitter from "./core/EventEmitter.js";
import StateManager from "./core/StateManager.js";
import defaultState from "./constants/defaults.js";
import UploadService from "./services/UploadService.js";

export default class DatabaseFileManager {
    constructor({config = {}}) {
        this.configs = new Config(config);
        this.eventBus = new EventEmitter()
        this.states = new StateManager({eventBus: this.eventBus, initialState: defaultState})
        this.endPoint = this.configs?.section('api')
        this.uploader();
    }

    uploader() {
        new UploadService({
           url : this.endPoint.updateUrl,
            els : {
               dropzone : this.configs.get('ui.dropzoneSelector'),
               input : this.configs.get('ui.fileInputSelector'),

            }
       });
    }




}
