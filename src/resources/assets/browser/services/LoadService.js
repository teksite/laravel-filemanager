import Events from "../constants/events.js";
import Service from "../Foundation/BaseServices.js";


export default class LoadService extends Service {


    initialize() {
        if (this.options.getOnInit) this.sendRequest();
    }

    busEvents() {

        return {
            [Events.FILES_NEED_MORE]: this.sendRequest,

            'load.disk': this.updateFilter,

            'load.type': this.updateFilter,
        };
    }


    async sendRequest() {

        if (this.state.get("load.loading")) return;

        if (!this.state.get("load.hasMore", true)) return;

        this.abortRequest();

        this.controller = new AbortController();

        const params = {

            cursor: this.state.get("load.cursor", null),

            disk: this.state.get("load.disk", null),

            mime_type: this.state.get("load.type", null),

            per_page: this.options.perPage,

            user_id: this.options.userId ?? null,

        };

        const signal = this.controller.signal;

        const {data, error, success} = await this.safe(
            async () => {
                this.state.set("load.loading", true);

                this.eventBus.emit(Events.FILES_REQUEST, {...params, action: 'load more'});

                const response = await this.request.getFiles(params, {signal});

                if (signal.aborted) return;

                const {files = [], meta = {}} = response;

                this.state.set("load.hasMore", Boolean(meta.has_more));

                this.state.set("load.cursor", meta.next_cursor ?? null);

                this.appendFiles(files);

                this.eventBus.emit(Events.FILES_RECEIVE, {files, meta, action: 'load more'});

                return {files, meta}
            },

            (error) => {

                if (error.name === 'AbortError') return;

                this.errorBus?.emit?.(error);

                this.eventBus.emit(Events.FILES_REQUEST_FAILED, error, {action: 'load more'});
            }, () => {

                if (this.controller?.signal === signal) this.controller = null;

                this.state.set("load.loading", false);
            }
        );

        return {data, error, success};
    }


    appendFiles(files = []) {

        const normalized = Array.isArray(files)
            ? Object.fromEntries(files.map(file => [file.id, file]))
            : files;

        const pre = this.state.get("load.files", {});

        const next = {...pre, ...normalized};

        this.state.set("load.files", next);

        this.state.set("load.append", normalized);
    }


    async updateFilter() {

        this.abortRequest();

        this.reset();

        await this.sendRequest();
    }


    reset(files = {}) {

        this.state.set('load.cursor', null);

        this.state.set('load.hasMore', true);

        this.state.set('load.files', files);

        this.state.set('load.append', {});

        this.eventBus.emit(Events.GRID_CLEAR, {});
    }


    abortRequest() {

        this.controller?.abort();

        this.controller = null;
    }


    destroy() {

        this.abortRequest();

        super.destroy();
    }


}
