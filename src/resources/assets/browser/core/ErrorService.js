import EVENTS from "../constants/events.js";

export default class ErrorService {

    constructor(options = {} ,eventBus =null) {

        this.options = {debug: false, showToUser: true, maxStackLength: 1000, ...options};

        this.handlers = [];
        this.eventBus = eventBus;
    }

    /**
     * Attach external event emitter (FileManager instance)
     */
    bindEventBus(eventBus) {
        this.eventBus = eventBus;
    }

    /**
     * Register custom error handler
     */
    onError(handler) {
        if (typeof handler === 'function') {
            this.handlers.push(handler);
        }
    }

    /**
     * Main error dispatcher
     */
    emit(error, context = {}) {

        const normalized = this.normalize(error, context);

        // 1. console logging (debug only)
        if (this.options.debug) {
            console.error('[FileManager Error]', normalized);
        }

        // 2. external handlers
        for (const handler of this.handlers) {
            try {
                handler(normalized);
            } catch (e) {
                console.error('[ErrorService Handler Failed]', e);
            }
        }

        // 3. event system
        if (this.eventBus?.emit) {
            this.eventBus.emit(EVENTS.ERROR, normalized);
        }

        // 4. UI fallback
        if (this.options.showToUser) {
            this.showToUser(normalized.message);
        }

        return normalized;
    }

    /**
     * Safe fetch wrapper (centralized error handling)
     */
    async safeFetch(url, options = {}, context = {}) {

        try {
            const res = await fetch(url, options);

            if (!res.ok) {
                const error = new Error(`HTTP ${res.status}`);
                throw this.emit(error, { ...context, url, status: res.status });
            }

            return await res.json();

        } catch (error) {
            throw this.emit(error, { ...context, url });
        }
    }

    /**
     * Normalize error object
     */
    normalize(error, context) {

        return {
            message: error?.message || 'Unknown error',
            name: error?.name || 'Error',
            stack: this.trimStack(error?.stack),
            context,
            timestamp: Date.now()
        };
    }

    /**
     * Prevent huge stack leaks in UI/logs
     */
    trimStack(stack) {
        if (!stack || typeof stack !== 'string') return null;
        return stack.length > this.options.maxStackLength
            ? stack.slice(0, this.options.maxStackLength) + '...'
            : stack;
    }

    /**
     * UI fallback error (can be overridden later by UI service)
     */
    showToUser(message) {

        const container = document.querySelector('[data-messages]');
        if (!container) return;

        const el = document.createElement('div');
        el.className = 'upload-message error';

        el.innerHTML = `
            <span>✕</span>
            <span>${this.escapeHtml(message)}</span>
        `;

        container.prepend(el);

        setTimeout(() => el.remove(), 5000);
    }

    /**
     * XSS-safe text rendering
     */
    escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
