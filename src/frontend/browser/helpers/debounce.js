/**
 * Debounce utility
 * Prevents function from being called too frequently.
 *
 * @param {Function} fn
 * @param {number} delay
 * @param {Object} options
 * @returns {Function}
 */
export default function debounce(fn, delay = 300, options = {}) {

    let timer = null;

    const {immediate = false} = options;

    return function debounced(...args) {

        const context = this;

        const callNow = immediate && !timer;

        clearTimeout(timer);

        timer = setTimeout(() => {
            timer = null;

            if (!immediate) {
                fn.apply(context, args);
            }

        }, delay);

        if (callNow) {
            fn.apply(context, args);
        }
    };
}
