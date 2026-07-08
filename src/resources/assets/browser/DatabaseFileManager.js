import Config from "./core/Config.js";
import EventEmitter from "./core/EventEmitter.js";
import StateManager from "./core/StateManager.js";
import ErrorService from "./core/ErrorService.js";
import RequestService from "./core/RequestService.js";

import defaultState from "./constants/defaults.js";

import UploadService from "./services/UploadService.js";
import LoadService from "./services/LoadService.js";
import DeleteService from "./services/DeleteService.js";
import UpdateService from "./services/UpdateService.js";

import UploaderUi from "./ui/UploaderUi.js";
import GridUi from "./ui/GridUi.js";
import MoreBtnUi from "./ui/MoreBtnUi.js";
import InfoUi from "./ui/InfoUi.js";
import CounterUi from "./ui/CounterUi.js";
import FilterUi from "./ui/FilterUi.js";
import SelectService from "./services/SelectService.js";
import SelectionButtonUi from "./ui/SelectionButtonUi.js";
import SelectionGridUi from "./ui/SelectionGridUi.js";

export default class DatabaseFileManager {

    constructor({config = {}} = {}) {

        this.config = new Config(config);

        this.eventBus = new EventEmitter();
        this.errorBus = new ErrorService();
        this.state = new StateManager(this.eventBus, defaultState);

        this.request = new RequestService({
            url: this.config.section('api'),
            options: this.config.section('request'),
        }, this.errorBus);

        this.initializeUploader();
        this.initializeGrid();
        this.initializeInspector();
        this.initializeSelection();
    }


    /* -----------------------------------------------------------------
     | Upload
     |----------------------------------------------------------------- */

    initializeUploader() {

        this.uploadService = new UploadService({
            url: this.config.get('api.uploadUrl'),
            elements: {
                formEl: this.config.get('ui.uploadFormSelector'),
                dropzoneEl: this.config.get('ui.dropzoneSelector'),
                inputEl: this.config.get('ui.fileInputSelector'),
                previewEl: this.config.get('ui.uploadPreviewSelector'),
                diskSelectorEl: this.config.get('ui.uploadDiskSelector'),
            },
            options: this.config.section('upload'),

        }, this.eventBus, this.state, this.errorBus);


        this.uploaderUi = new UploaderUi({

            uploadPreviewSelector: this.config.get('ui.uploadPreviewSelector')

        }, this.eventBus, this.state);
    }


    /* -----------------------------------------------------------------
     | Loader
     |----------------------------------------------------------------- */

    initializeGrid() {

        this.loadService = new LoadService({
            url: this.config.get('api.getUrl'),
            options: {...this.config.section('load'), ...this.config.section('filter')},
        }, this.eventBus, this.state, this.request, this.errorBus);


        this.gridUi = new GridUi({
            elements: {
                gridEl: this.config.get('ui.gridSelector'),
                loadingEl: this.config.get('ui.loadingSelector'),
            }
        }, {
            loadingStyle: this.config.get('load.loadingStyle', 'block')
        }, this.eventBus, this.state);


        this.moreBtnUi = new MoreBtnUi({
            btnEl: this.config.get('ui.loadMoreSelector')
        }, this.eventBus, this.state);


        this.counterUi = new CounterUi({
            elements: {
                counterEl: this.config.get('ui.filesCounterSelector'),
            }
        }, {}, this.eventBus, this.state);


        this.counterUi = new FilterUi({
            elements: {
                mimesEl: this.config.get('ui.mimesSelector'),
                disksEl: this.config.get('ui.disksSelector'),
            }
        }, {}, this.eventBus, this.state);


    }


    /* -----------------------------------------------------------------
     | File Inspector
     |----------------------------------------------------------------- */

    initializeInspector() {

        this.updateService = new UpdateService({
            url: this.config.get('api.updateUrl'),
        }, this.eventBus, this.state, this.request, this.errorBus);


        this.deleteService = new DeleteService({
            url: this.config.get('api.deleteUrl'),
        }, this.eventBus, this.state, this.request, this.errorBus);


        this.infoUi = new InfoUi({

            elements: {

                baseInfoEl: this.config.get('ui.baseInfoSelector'),
                filePreviewEl: this.config.get('ui.filePreviewSelector'),

                idInfoEl: this.config.get('ui.idInfoSelector'),
                titleInfoEl: this.config.get('ui.titleInfoSelector'),
                urlInfoEl: this.config.get('ui.urlInfoSelector'),
                sizeInfoEl: this.config.get('ui.sizeInfoSelector'),
                mimeInfoEl: this.config.get('ui.mimeInfoSelector'),
                diskInfoEl: this.config.get('ui.diskInfoSelector'),
                createdInfoEl: this.config.get('ui.createdInfoSelector'),

                deleteBtnEl: this.config.get('ui.deleteBtnSelector'),
                copyBtnEl: this.config.get('ui.copyUrlBtnSelector'),
                openBtnEl: this.config.get('ui.openUrlBtnSelector'),
            }
        }, {}, this.eventBus, this.state);
    }


    /* -----------------------------------------------------------------
     | Selection
     |----------------------------------------------------------------- */


    initializeSelection() {
        this.selectionService = new SelectService(
            this.config.section('selection'), this.eventBus, this.state);

        this.selectionUi = new SelectionButtonUi({
            elements: {
                actionsEl: this.config.get('ui.selectionButtonSelector'),
            }
        }, this.config.section('selection'), this.eventBus, this.state);

        this.selectionGridUi = new SelectionGridUi({
            elements: {
                gridEl: this.config.get('ui.selectionGridSelector'),
            }
        }, this.config.section('selection'), this.eventBus, this.state);


    }


    destroy() {

        [
            this.selectionService,
            this.uploadService,
            this.loadService,
            this.updateService,
            this.deleteService,

            this.selectionUi,
            this.uploaderUi,
            this.gridUi,
            this.moreBtnUi,
            this.counterUi,
            this.infoUi,
            this.selectionGridUi,

        ].forEach(instance => instance?.destroy?.());
    }

    getSelection() {

        const output = this.state.get('select.file', []);
        this.state.set('select.file', null);
        return output;
    }


}
