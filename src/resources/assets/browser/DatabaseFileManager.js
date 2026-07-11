import Config from "./core/Config.js";
import EventEmitter from "./core/EventEmitter.js";
import StateManager from "./core/StateManager.js";
import ErrorService from "./core/ErrorService.js";
import RequestService from "./core/RequestService.js";

import defaultState from "./constants/defaults.js";
import Events from "./constants/events.js";

// import UploadService from "./services/UploadService.js";
import LoadService from "./services/LoadService.js";
import DeleteService from "./services/DeleteService.js";
import UpdateService from "./services/UpdateService.js";
import SelectService from "./services/SelectService.js";

import GridUi from "./ui/GridUi.js";
import MoreButtonUi from "./ui/MoreButtonUi.js";
import InfoUi from "./ui/InfoUi.js";
import CounterUi from "./ui/CounterUi.js";
import FilterUi from "./ui/FilterUi.js";
import SelectionButtonUi from "./ui/SelectionButtonUi.js";
import SelectionGridUi from "./ui/SelectionGridUi.js";
import UploaderUi from "./ui/UploaderUi.js";
import UploadService from "./services/UploadService.js";


export default class DatabaseFileManager {


    constructor({config = {}, root = document} = {}) {

        this.root = typeof root === "string" ? document.querySelector(root) : root;

        if (!this.root) {
            throw new Error("FileManager root element not found");
        }


        this.config = new Config(config);

        this.root = typeof root === 'string'
            ? document.querySelector(root)
            : root;


        this.eventBus = new EventEmitter();

        this.errorBus = new ErrorService();

        this.state = new StateManager(this.eventBus, defaultState);


        this.request = new RequestService({

            url: this.config.section('api'),

            options: this.config.section('request')

        }, this.errorBus);


        this.instances = [];

        this._listeners = [];

        this.boot();


    }


    /*
    |--------------------------------------------------------------------------
    | Components Registry
    |--------------------------------------------------------------------------
    */


    components() {
        return [

            [LoadService, {
                url: this.config.get('api.getUrl'),

                ...this.config.section('load'),
                ...this.config.section('filter')

            }],


            [GridUi, {
                elements: {
                    gridEl: this.config.get('ui.gridSelector'),
                    loadingEl: this.config.get('ui.loadingSelector')
                },
                loadingStyle: this.config.get('load.loadingStyle', 'block')
            }],


            [MoreButtonUi, {
                elements: {
                    btnEl: this.config.get('ui.loadMoreSelector')
                }
            }],


            [SelectService,
                this.config.section('selection')
            ],


            [InfoUi, {
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

                    openBtnEl: this.config.get('ui.openUrlBtnSelector')
                }
            }],


            [UpdateService, {
                url: this.config.get('api.updateUrl')
            }],


            [DeleteService, {
                url: this.config.get('api.deleteUrl')
            }],


            [DeleteService, {
                url: this.config.get('api.deleteUrl')
            }],


            [CounterUi, {
                elements: {
                    counterEl: this.config.get('ui.filesCounterSelector')
                }
            }],


            [FilterUi, {
                elements: {
                    mimesEl: this.config.get('ui.mimesSelector'),
                    disksEl: this.config.get('ui.disksSelector')
                }
            }],


            [SelectionGridUi, {
                elements: {
                    gridEl: this.config.get('ui.selectionGridSelector')
                }
            }],


            [SelectionButtonUi, {
                elements: {
                    actionsEl: this.config.get('ui.selectionButtonSelector')
                },
                config: this.config.section('selection')
            }],


            [UploaderUi, {
                elements: {
                    uploadPreviewSelector: this.config.get('ui.uploadPreviewSelector'),

                    formEl: this.config.get('ui.uploadFormSelector'),

                    dropzoneEl: this.config.get('ui.dropzoneSelector'),

                    inputEl: this.config.get('ui.fileInputSelector'),

                    previewEl: this.config.get('ui.uploadPreviewSelector'),

                    diskSelectorEl: this.config.get('ui.uploadDiskSelector'),
                },

            }],

            [UploadService, {
                url: this.config.get('api.updateUrl'),
                ...this.config.section('upload'),
            }],


        ];
    }


    boot() {
        this.instances = this.components().map(([Component, options]) => {
            return this.register(Component, {...options});
        });

        this.bindEvents();
    }

    register(Component, options = {}) {

        return new Component(this, options);
    }


    bindEvents() {

        this.handleSelection = this.handleSelection.bind(this);

        this.listen(Events.SELECTION_ON_CHOOSE, this.handleSelection);
    }


    listen(event, callback) {

        this.eventBus.on(event, callback);

        this._listeners.push({event, callback});
    }


    handleSelection() {

        const selection = this.instances.find(item => item instanceof SelectService);

        if (!selection) return;

        const files = selection.returnSelections();

        this.emit(Events.CHOOSE, files);
    }


    emit(event, payload = {}) {

        this.eventBus.emit(event, payload);
    }


    on(event, callback) {

        this.eventBus.on(event, callback);

        return this;
    }


    off(event, callback) {

        this.eventBus.off(event, callback);

        return this;
    }


    once(event, callback) {

        const wrapper = (...args) => {

            callback(...args);

            this.off(event, wrapper);
        };

        this.on(event, wrapper);

        return this;

    }


    destroy() {
        for (const item of this._listeners) {

            this.eventBus.off(item.event, item.callback);
        }

        for (const instance of this.instances) {

            instance.destroy?.();
        }

        this.instances.length = 0;
    }
}
