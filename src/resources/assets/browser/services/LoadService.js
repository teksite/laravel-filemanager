import {$} from "../helpers/dom.js";
import Events from "../constants/events.js";
import events from "../constants/events.js";

export default class LoadService {

    constructor({url, options = {}}, eventBus, state, requestService, errorService) {

        this.options = {
            endpoint: url ?? '/api/filemanager',
            ...options
        };
        this.handlers = [];

        this.eventBus = eventBus;
        this.state = state;
        this.request = requestService;
        this.errorBus = errorService;
        this.sendRequest = this.sendRequest.bind(this);


        if (this.options.getOnInit ?? true) this.sendRequest();
        this.bindDomEvents();

    }

    bindDomEvents() {
        this.eventBus.on(events.FILES_NEED_MORE, this.sendRequest)
    }


    async sendRequest() {
        const loading = this.state.get('load.loading', false);
        if (loading) return;

        const hasMore = this.state.get('load.hasMore', true);
        if (!hasMore) return;

        const cursor = this.state.get('load.cursor');
        const disk = this.state.get('load.disk');
        const mime_type = this.state.get('load.type');

        this.eventBus.emit(events.FILES_REQUEST, {
            cursor,
            mime_type,
            disk,
        });

        const {files, meta} = await this.request.getFiles({
            cursor,
            mime_type,
            disk
        });

        this.eventBus.emit(events.FILES_LOADED, {
            files,
            meta
        });

        this.eventBus.emit(events.FILES_RECEIVE, {
            files,
            meta,
        });

        this.state.set('load.hasMore', meta.has_more)
        this.state.set('load.cursor', meta.next_cursor);
        this.setFiles(files);

    }


    setFiles(files = []) {
        this.state.set('load.files', files);
        console.log(this.state.get('load.files'));

    }

    stop() {

    }

    destroy() {
        this.stop();
    }
}
