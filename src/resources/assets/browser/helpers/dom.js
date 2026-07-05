// resources/js/filemanager/helpers/dom.js

/**
 * Safe DOM selector (single element)
 */
export function $(selector, root = document) {
    if (!selector) return null;
    return root.querySelector(selector);
}

/**
 * Safe DOM selector (multiple elements)
 */
export function $all(selector, root = document) {
    if (!selector) return [];
    return Array.from(root.querySelectorAll(selector));
}

/**
 * Create element with optional class and html
 */
export function create(tag, {className = '', html = ''} = {}) {
    const el = document.createElement(tag);

    if (className) el.className = className;
    if (html) el.innerHTML = html;

    return el;
}

/**
 * Remove all children safely
 */
export function clear(el) {
    if (!el) return;
    el.replaceChildren();
}

/**
 * Safe set HTML (prevents null crash)
 */
export function setHTML(el, html = '') {
    if (!el) return;
    el.innerHTML = html;
}

/**
 * Safe text setter
 */
export function setText(el, text = '') {
    if (!el) return;
    el.textContent = text;
}

/**
 * Remove element safely
 */
export function remove(el) {
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
}

/**
 * Append multiple nodes efficiently
 */
export function appendMany(parent, nodes = []) {
    if (!parent || !nodes.length) return;

    const fragment = document.createDocumentFragment();

    for (const node of nodes) {
        if (node) fragment.appendChild(node);
    }

    parent.appendChild(fragment);
}

/**
 * Prepend multiple nodes efficiently
 */
export function prependMany(parent, nodes = []) {
    if (!parent || !nodes.length) return;

    const fragment = document.createDocumentFragment();

    for (const node of nodes) {
        if (node) fragment.appendChild(node);
    }

    parent.prepend(fragment);
}

/**
 * Check if element exists in DOM
 */
export function exists(el) {
    return !!(el && el.nodeType === 1);
}


export function escapeHtml(str) {

    return str.replace(/[&<>"']/g, m => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'}[m]));

}
