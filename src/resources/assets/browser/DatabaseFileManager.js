import Config from "./core/Config.js";
import EventEmitter from "./core/EventEmitter.js";
import StateManager from "./core/StateManager.js";
import defaultState from "./constants/defaults.js";
import UploadService from "./services/UploadService.js";
import UploaderUi from "./ui/UploaderUi.js";
import ErrorService from "./core/ErrorService.js";
import RequestService from "./core/RequestService.js";
import LoadService from "./services/LoadService.js";
import MoreBtnUi from "./ui/MoreBtnUi.js";
import GridUi from "./ui/GridUi.js";
import InfoUi from "./ui/InfoUi.js";
import DeleteService from "./services/DeleteService.js";
import FooterUi from "./ui/FooterUi.js";

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
        this.informer();
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


        this.GridUi = new GridUi({
            elements: {
                btnEl: this.configs.get('ui.gridSelector', '[data-grid]'),
                loadingEl: this.configs.get('ui.loadingSelector', '[data-loading]')
            },
        }, {
            loadingStyle: this.configs.get('load.loadingStyle', 'block')
        }, this.eventBus, this.states)


        this.footerUi = new FooterUi({
            elements: {
                counterEl: this.configs.get('ui.filesCounter', '[data-file-counter]'),
            },
        }, {}, this.eventBus, this.states)
    }


    informer() {

        this.deleteService = new DeleteService({
            url: this.configs.get('api.deleteUrl'),
            options: {}
        }, this.eventBus, this.states, this.request, this.errorBus);

        this.infoUi = new InfoUi({
            elements: {
                baseInfoEl: this.configs.get('baseInfoSelector', '[data-aside]'),
                filePreviewEl: this.configs.get('filePreviewSelector', '[data-preview]'),
                idInfoEl: this.configs.get('idInfoSelector', '[data-id]'),
                titleInfoEl: this.configs.get('titleInfoSelector', '[data-title]'),
                urlInfoEl: this.configs.get('urlInfoSelector', '[data-url]'),
                sizeInfoEl: this.configs.get('sizeInfoSelector', '[data-size]'),
                mimeInfoEl: this.configs.get('mimeInfoSelector', '[data-mime]'),
                diskInfoEl: this.configs.get('diskInfoSelector', '[data-disk]'),
                createdInfoEl: this.configs.get('createdInfoSelector', '[data-created]'),

                deleteBtnEl: this.configs.get('deleteBtnSelector', '[data-delete]'),
                copyBtnEl: this.configs.get('copyUrlBtnSelector', '[data-open]'),
                openBtnEl: this.configs.get('openBtnSelector', '[data-copy]'),
            }
        }, {}, this.eventBus, this.states);
    }

    destroy() {
        this.previewUi?.destroy();
        this.uploadService?.destroy();


        this.GridUi?.destroy();
        this.moreBtnUi?.destroy();
        this.loaderService?.destroy();
        this.footerUi?.destroy();


        this.infoUi?.destroy();
        this.deleteService?.destroy();
    }


}
