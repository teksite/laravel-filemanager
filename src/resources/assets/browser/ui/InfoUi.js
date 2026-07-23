import UiService from "../Foundation/UiService.js";
import Events from "../constants/events.js";
import formatSize from "../helpers/formatSize.js";
import {renderMedia} from "../helpers/preview.js";
import handler from "../helpers/handler.js";


export default class InfoUi extends UiService {

    constructor(app, options) {
        super(app, options)

        this.initialize();
    }

    defineElements() {

        return {

            baseInfoEl: this.config.get('ui.baseInfoSelector', '[data-aside]'),

            filePreviewEl: this.config.get('ui.filePreviewSelector', '[data-preview]'),

            idInfoEl: this.config.get('ui.idInfoSelector', '[data-id]'),

            titleInfoEl: this.config.get('ui.titleInfoSelector', '[data-title]'),

            urlInfoEl: this.config.get('ui.urlInfoSelector', '[data-url]'),

            sizeInfoEl: this.config.get('ui.sizeInfoSelector', '[data-size]'),

            mimeInfoEl: this.config.get('ui.mimeInfoSelector', '[data-mime]'),

            diskInfoEl: this.config.get('ui.diskInfoSelector', '[data-disk]'),

            createdInfoEl: this.config.get('ui.createdInfoSelector', '[data-created]'),

            deleteBtnEl: this.config.get('ui.deleteBtnSelector', '[data-delete]'),

            copyBtnEl: this.config.get('ui.copyUrlBtnSelector', '[data-copy]'),

            openBtnEl: this.config.get('ui.openUrlBtnSelector', '[data-open]')
        };
    }


    shouldInitialize() {

        return Boolean(this.baseInfoEl);
    }


    initialize() {

        this.current = null;

        this.editingTitle = false;

        this.primaryPreviewText = this.filePreviewEl?.textContent ?? 'select media';


    }


    busEvents() {


        return {


            'select.current':
                ({value}) => {

                    this.revealInfo(value);

                    this.activeButtons(
                        Boolean(value)
                    );

                },


            [Events.FILE_DELETED]:
                ({fileId}) => {

                    this.handleDeletedFile(
                        fileId
                    );

                },


            [Events.FILE_UPDATE_TITLE_FAILED]:
                ({fileId, title, oldTitle}) => {

                    this.recoverTitle(
                        fileId,
                        title,
                        oldTitle
                    );

                }


        };


    }


    domEvents() {


        return [

            [
                this.copyBtnEl,
                'click',
                this.copyUrl
            ],


            [
                this.openBtnEl,
                'click',
                this.openFile
            ],


            [
                this.deleteBtnEl,
                'click',
                this.emitDeleteRequest
            ],


            [
                this.titleInfoEl,
                'dblclick',
                this.enableEditTitleMode
            ]

        ];


    }


    revealInfo(fileId) {


        const files =
            this.state.get(
                'load.files',
                {}
            );


        const file =
            files[fileId];


        this.current =
            file ?? null;


        this.idInfoEl.textContent =
            file?.id ?? '-';


        this.titleInfoEl.textContent =
            file?.title ?? '-';


        this.urlInfoEl.textContent =
            file?.url ?? '-';


        this.sizeInfoEl.textContent =
            formatSize(
                file?.size ?? 0
            );


        this.mimeInfoEl.textContent =
            file?.mime_type ?? '-';


        this.diskInfoEl.textContent =
            file?.disk ?? '-';


        this.createdInfoEl.textContent =
            file?.created_at ?? '-';


        this.renderPreview(file);


    }


    renderPreview(item) {


        if (!this.filePreviewEl) {
            return;
        }


        if (!item) {

            this.filePreviewEl.textContent =
                this.primaryPreviewText;


            return;

        }


        this.filePreviewEl.innerHTML =
            renderMedia(item , true);


    }


    activeButtons(active = false) {


        const disabled =
            !active;


        if (this.deleteBtnEl)
            this.deleteBtnEl.disabled = disabled;


        if (this.copyBtnEl)
            this.copyBtnEl.disabled = disabled;


        if (this.openBtnEl)
            this.openBtnEl.disabled = disabled;


    }


    handleDeletedFile(fileId) {


        if (
            this.current?.id !== fileId
        ) {
            return;
        }


        this.current = null;


        this.renderPreview(null);


        this.activeButtons(false);


    }


    async copyUrl() {


        if (
            !this.current?.url ||
            !navigator.clipboard
        ) {
            return;
        }


        await handler({


            resolve:
                async () => {


                    await navigator.clipboard.writeText(
                        this.current.url
                    );


                    this.eventBus.emit(
                        Events.FILE_URL_COPIED,
                        {
                            file: this.current
                        }
                    );


                },


            reject:
                error => {


                    this.eventBus.emit(
                        Events.FILE_URL_COPIED_FAILED,
                        {
                            file: this.current
                        }
                    );


                    throw error;

                }


        });


    }


    openFile() {


        if (!this.current?.url) {
            return;
        }


        window.open(
            this.current.url,
            '_blank',
            'noopener,noreferrer'
        );


    }


    emitDeleteRequest() {


        if (!this.current?.id) {
            return;
        }


        if (
            !confirm(
                'Are you sure you want to permanently delete this file?'
            )
        ) {
            return;
        }


        this.eventBus.emit(
            Events.FILE_DELETE_SIGNAL,
            {
                fileId: this.current.id
            }
        );


    }


    enableEditTitleMode() {


        if (
            !this.current ||
            this.editingTitle
        ) {
            return;
        }


        this.editingTitle = true;


        this.renderTitleEditor();


    }


    renderTitleEditor() {


        const input =
            document.createElement('input');


        input.type = 'text';

        input.value =
            this.current.title ?? '';


        const oldTitle =
            this.current.title ?? '';


        this.titleInfoEl.replaceChildren(
            input
        );


        input.focus();

        input.select();


        let done = false;


        const submit = () => {


            if (done) {
                return;
            }


            done = true;

            this.editingTitle = false;


            const newTitle =
                input.value.trim();


            if (oldTitle === newTitle) {

                this.renderTitle();

                return;

            }


            this.current.title =
                newTitle;


            this.renderTitle();


            this.eventBus.emit(
                Events.FILE_UPDATE_TITLE_SIGNAL,
                {
                    fileId: this.current.id,
                    title: newTitle,
                    oldTitle
                }
            );


        };


        input.addEventListener(
            'keydown',
            e => {


                if (e.key === 'Enter') {

                    e.preventDefault();

                    submit();

                }


                if (e.key === 'Escape') {

                    done = true;

                    this.editingTitle = false;

                    this.renderTitle();

                }


            }
        );


        input.addEventListener(
            'blur',
            submit
        );


    }


    recoverTitle(
        fileId,
        title,
        oldTitle
    ) {


        if (
            this.current?.id !== fileId
        ) {
            return;
        }


        this.current.title =
            oldTitle;


        this.renderTitle();


    }


    renderTitle() {


        this.titleInfoEl.textContent =
            this.current?.title?.length
                ? this.current.title
                : '-';


    }


}
