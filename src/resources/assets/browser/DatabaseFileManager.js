import Config from "./core/Config.js";
import EventEmitter from "./core/EventEmitter.js";
import StateManager from "./core/StateManager.js";
import defaultState from "./constants/defaults.js";
import UploadService from "./services/UploadService.js";
import UploaderPreviewUi from "./ui/UploaderPreviewUi.js";
import ErrorService from "./services/ErrorService.js";
import RequestService from "./services/RequestService.js";
import LoadService from "./services/LoadService.js";

export default class DatabaseFileManager {
    constructor({config = {}}) {

        this.configs = new Config(config);

        this.eventBus = new EventEmitter();
        this.errorBus = new ErrorService();

        this.states = new StateManager(this.eventBus, defaultState);

        this.request = new RequestService({

            api: this.configs.section('api'),
            options: this.configs.section('request')

        }, this.errorBus)

        this.uploader();
        this.loader();
    }

    uploader() {

        this.uploadService = new UploadService({
            url: this.configs.get('api.uploadUrl'),
            elements: {
                formEl: this.configs.get('ui.uploadFormSelector'),
                dropzoneEl: this.configs.get('ui.dropzoneSelector'),
                inputEl: this.configs.get('ui.fileInputSelector'),
                previewEl: this.configs.get('ui.uploadPreviewSelector'),

                diskSelectorEl: this.configs.get('ui.uploadDiskSelector'),
            },
            options: this.configs.section('upload'),
        }, this.eventBus, this.states, this.errorBus);

        this.previewUi = new UploaderPreviewUi({
            uploadPreviewSelector: this.configs.get('ui.uploadPreviewSelector')
        }, this.eventBus, this.states);
    }


    loader() {
        this.loaderService = new LoadService({
            url: this.configs.get('api.getUrl'),
            elements: {
                gridEl: this.configs.get('ui.gridSelector'),
                loadingEl: this.configs.get('ui.loadingSelector'),
                loadMoreEl: this.configs.get('ui.loadMoreSelector'),
                mimesEl: this.configs.get('ui.mimesSelector'),
                disksEl: this.configs.get('ui.disksSelector'),
            },
            options: this.configs.section('load'),
        }, this.eventBus, this.states, this.request, this.errorBus)
    }


    destroy() {
        this.uploadService?.destroy();
        this.previewUi?.destroy();


        this.loaderService?.destroy();
    }


}
