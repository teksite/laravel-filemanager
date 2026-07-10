import UiService from "../Foundation/UiService.js";
import events from "../constants/events.js";
import {uniqueString} from "../helpers/general.js";


export default class UploaderUi extends UiService {

    shouldInitialize() {

        return Boolean(this.formEl && this.dropzoneEl && this.inputEl);
    }


    defineElements() {

        return {

            uploadPreviewSelector: this.config.get('ui.uploadPreviewSelector'),

            formEl: this.config.get('ui.uploadFormSelector'),

            dropzoneEl: this.config.get('ui.dropzoneSelector'),

            inputEl: this.config.get('ui.fileInputSelector'),

            previewEl: this.config.get('ui.uploadPreviewSelector'),

            diskSelectorEl: this.config.get('ui.uploadDiskSelector'),
        };
    }


    busEvents() {
        return {

            /*    [Events.GRID_CLEAR]: () => {
                    this.emptyGrid();
                },

                'load.append': ({value}) => {
                    this.appendFile(value);
                },*/

        };
    }

    domEvents() {

        return [
            [this.dropzoneEl, 'click', this.resolveClickOnZone],

            [this.dropzoneEl, 'dragover', this.dragOverHandler],

            [this.dropzoneEl, 'drop', this.dropHandler],

            [this.inputEl, 'change', this.changeInputHandler],

            [this.formEl, 'submit', this.FormDefaultSubmit],
        ];

    }

    resolveClickOnZone(event) {
        this.inputEl.click();
    }

    dragOverHandler(event) {

        event.preventDefault();
    }

    dropHandler(event) {

        event.preventDefault();

        this.updateSelectedFiles(event.dataTransfer.files);
    }

    changeInputHandler(event) {
        this.updateSelectedFiles(event.target.files);
    }

    updateSelectedFiles(files) {

        const revoked = this.revokeFiles(files)
        const {validated, failed} = this.validateMimes(revoked);
        // this.state.set('upload.files', [...validatedFiles]);

    }

    FormDefaultSubmit(event) {

        console.log('FormDefaultSubmit', event);

        this.emit(events.UPLOAD_SIGNAL, {})

    }


    revokeFiles(files = {}) {

        return Object.values(files).reduce((acc, file) => {
            acc[uniqueString()] = file;
            return acc;
        }, {});
    }

    validateMimes(files = {}) {
        console.log(this.config)
        const Mimes = this.config.section('upload.allowedMimes', [])
        if (!Mimes.length) return {validated:  files};

        Mimes.map(mime => mime.toLowerCase());
        let validated = {}
        //
        // let failed = {}
        //
        // Object.entries(files).forEach(([id, file])=>{
        //     if (Mimes.include((file.type).toLowerCase)){
        //        return  validated[id]= file
        //     }
        //     return  failed[id]= file
        // });
        //
        // console.log(validated , failed)
return {validated , failed}

    }


}
