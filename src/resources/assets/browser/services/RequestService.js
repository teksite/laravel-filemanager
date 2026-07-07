import handler from "../helpers/handler.js";

export default class RequestService {

    constructor({url, options} = {}, errorBus = null) {
        this.options = {...options, ...url}
        this.errorBus = errorBus;
        this.controllers = new Set();
    }


    async request(url, options = {}) {

        const base = this.options.baseUrl || window.location.origin;
        const fullUrl = new URL(url, base).href;

        const timeoutMs = options.timeout ?? this.options.timeout;

        const controller = new AbortController();

        let timeoutId = null;

        if (timeoutMs > 0) {
            timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        }

        this.controllers.add(controller);

        const result = await handler({

            resolve: async () => {

                const response = await fetch(fullUrl, {
                    ...options,
                    signal: controller.signal
                });

                if (!response.ok) {
                    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                    error.status = response.status;

                    throw error;
                }

                if (response.status === 204) {
                    return null;
                }

                const contentType = response.headers.get("content-type") ?? "";

                if (contentType.includes("application/json")) {
                    return response.json();
                }

                return response.text();
            },

            reject: async (error) => {

                if (error.name !== "AbortError") {
                    this.errorBus?.emit(error, {
                        url: fullUrl,
                        status: error.status,
                        method: options.method ?? "GET"
                    });
                }

                throw error;
            },

            final: () => {
                if (timeoutId) clearTimeout(timeoutId);
                this.controllers.delete(controller);
            }

        });

        if (!result.success) {
            throw result.error;
        }

        return result.data;
    }
    get(url, params = {}, options = {}) {

        const query = this.buildQuery(params);
        return this.request(query ? `${url}?${query}` : url, {
                ...options,
                method: 'GET'
            }
        );
    }

    post(url, body = {}, options = {}) {
        return this.sendWithBody(
            'POST',
            url,
            body,
            options
        );
    }

    patch(url, body = {}, options = {}) {
        return this.sendWithBody(
            'PATCH',
            url,
            body,
            options
        );
    }

    delete(url, options = {}) {
        return this.request(url, {
            ...options,
            method: 'DELETE'
        });
    }


    /* tools */
    buildQuery(params = {}) {
        return new URLSearchParams(Object.entries(params).filter(([, value]) =>
                value !== undefined &&
                value !== null &&
                value !== ''
            )
        ).toString();
    }

    sendWithBody(method, url, body, options = {}) {
        return this.request(url, {
            ...options,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(body)
        });
    }

    createController(timeoutMs) {
        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort(new Error('Request timeout'));
        }, timeoutMs);

        this.controllers.add(controller);

        return {controller, timeout};
    }

    cancelAll() {
        for (const controller of this.controllers) {
            controller.abort();
        }
        this.controllers.clear();
    }


    /* ---- For the App -----  */

    getFiles({cursor = null, disk = null, mime_type = null} = {}) {
        const endPoint = this.options.getUrl ?? '/api/filemanager';

        return this.get(endPoint, {cursor, disk, mime_type});
    }

}
