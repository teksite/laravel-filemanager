import Config from "./core/Config.js";
import EventEmitter from "./core/EventEmitter.js";
import StateManager from "./core/StateManager.js";
import defaultState from "./constants/defaults.js";
import UploadService from "./services/UploadService.js";
import UploaderUi from "./ui/UploaderUi.js";
import ErrorService from "./core/ErrorService.js";
import RequestService from "./services/RequestService.js";
import LoadService from "./services/LoadService.js";
import MoreBtnUi from "./ui/MoreBtnUi.js";
import GridUi from "./ui/GridUi.js";

export default class DatabaseFileManager {
    constructor({config = {}}) {

        this.configs = new Config(config);

        this.eventBus = new EventEmitter();
        this.errorBus = new ErrorService();

        this.states = new StateManager(this.eventBus, defaultState);

        this.request = new RequestService({
            url: this.configs.section('api'),
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

        this.previewUi = new UploaderUi({
            uploadPreviewSelector: this.configs.get('ui.uploadPreviewSelector')
        }, this.eventBus, this.states);
    }


    loader() {
        this.loaderService = new LoadService({
            url: this.configs.get('api.getUrl'),
            options: this.configs.section('load'),
        }, this.eventBus, this.states, this.request, this.errorBus);

        this.moreBtnUi = new MoreBtnUi({
            btnEl: this.configs.get('ui.loadMoreSelector', '[data-load-more]')
        }, this.eventBus, this.states);


        this.moreBtnUi = new GridUi({
            elements: {
                btnEl: this.configs.get('ui.gridSelector', '[data-grid]'),
                loadingEl: this.configs.get('ui.loadingSelector', '[data-loading]')
            },
        }, {
            loadingStyle: this.configs.get('load.loadingStyle', 'block')
        }, this.eventBus, this.states)
    }


    destroy() {
        this.uploadService?.destroy();
        this.previewUi?.destroy();


        this.loaderService?.destroy();
        this.moreBtnUi?.destroy();
    }


}
