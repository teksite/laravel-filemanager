import Config from "./core/Config.js";
import EventEmitter from "./core/EventEmitter.js";
import StateManager from "./core/StateManager.js";
import defaultState from "./constants/defaults.js";
import UploadService from "./services/UploadService.js";
import UploaderPreviewUi from "./ui/UploaderPreviewUi.js";
import RequestService from "./services/RequestService.js";
import ErrorService from "./services/ErrorService.js";

export default class DatabaseFileManager {
    constructor({config = {}}) {

        this.configs = new Config(config);
        this.eventBus = new EventEmitter();
        console.log(this.configs)
        this.states = new StateManager(this.eventBus, defaultState);
        this.errorBus = new ErrorService();
        this.request = new RequestService(this.configs.section('api'), this.configs.section('upload'), this.errorBus)

        this.uploader();
    }

    uploader() {
        new UploadService({
            url: this.configs.get('api.updateUrl'),
            elements: {
                formEl: this.configs.get('ui.uploadFormSelector'),
                dropzoneEl: this.configs.get('ui.dropzoneSelector'),
                inputEl: this.configs.get('ui.fileInputSelector'),
                previewEl: this.configs.get('ui.uploadPreviewSelector'),
            },
            option: this.configs.section('upload'),
        }, this.eventBus, this.states, this.errorBus);

        new UploaderPreviewUi({
            uploadPreviewSelector: this.configs.get('ui.uploadPreviewSelector')
        }, this.eventBus, this.states).render();
    }


}
