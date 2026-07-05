
export default class RequestService {

    constructor(baseConfig = {}, options = {}, errorBus = null) {

        this.options = {
            baseURL: baseConfig.baseURL ?? '',
            timeout: options.timeout ?? 10000,
            debug: options.debug ?? false
        };

        this.errorBus = errorBus;
        this.controllers = new Set();
    }

    buildQuery(params = {}) {
        const query = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') return;
            query.append(key, value);
        });

        return query.toString();
    }

    createController(timeoutMs) {
        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort(new Error('Request timeout'));
        }, timeoutMs);

        this.controllers.add(controller);

        return { controller, timeout };
    }

    async request(url, options = {}) {

        const fullUrl = this.options.baseURL + url;
        const timeoutMs = options.timeout ?? this.options.timeout;

        const { controller, timeout } = this.createController(timeoutMs);

        try {

            if (this.options.debug) {
                console.log('[Request]', fullUrl);
            }

            const res = await fetch(fullUrl, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeout);
            this.controllers.delete(controller);

            if (!res.ok) {
                const error = new Error(`HTTP ${res.status}`);

                this.errorBus?.emit(error, {
                    url: fullUrl,
                    status: res.status,
                    method: options.method || 'GET'
                });

                throw error;
            }

            return await res.json();

        } catch (error) {

            clearTimeout(timeout);
            this.controllers.delete(controller);

            if (error.name === 'AbortError') {
                if (this.options.debug) {
                    console.warn('[Request Aborted]', fullUrl);
                }
                return null;
            }

            this.errorBus?.emit(error, {
                url: fullUrl,
                method: options.method || 'GET'
            });

            throw error;
        }
    }

    get(url, params = {}, options = {}) {
        const query = this.buildQuery(params);
        return this.request(query ? `${url}?${query}` : url, {
            ...options,
            method: 'GET'
        });
    }

    post(url, body = {}, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            body: JSON.stringify(body)
        });
    }

    patch(url, body = {}, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            body: JSON.stringify(body)
        });
    }

    delete(url, options = {}) {
        return this.request(url, {
            ...options,
            method: 'DELETE'
        });
    }

    cancelAll() {
        this.controllers.forEach(c => c.abort());
        this.controllers.clear();
    }
}
