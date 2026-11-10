import {getMimeGroup, getMimeIcon} from "./mime.js";
import {escapeHtml} from "./dom.js";

/**
 * Only http(s), root-relative and same-page relative URLs may reach a src/href
 * attribute. This blocks javascript:/data: payloads coming from the API.
 */
export function safeUrl(url) {

    if (typeof url !== 'string' || url === '') return '';

    try {
        const parsed = new URL(url, window.location.origin);

        return ['http:', 'https:'].includes(parsed.protocol) ? url : '';
    } catch {
        return '';
    }
}

export function renderMedia(item, controls = false, wrapper = true) {

    if (!item?.id) return '';

    const mime = item.mime_type ?? '';

    const label = wrapper
        ? `<span class="preview-wrapper-icon">${getMimeIcon(mime)} ${escapeHtml(mime)}</span>`
        : '';

    return `<div class="preview-wrapper">${label}${renderPreview(item, controls)}</div>`;
}

function renderPreview(item, controls) {

    const mime = item.mime_type ?? '';

    const title = escapeHtml(item.title ?? item.original_name ?? '');

    const id = escapeHtml(item.id);

    // Lists use the small generated variant when it exists; the sidebar uses the original.
    const url = escapeHtml(safeUrl(controls ? item.url : (item.thumbnail_url ?? item.url)));

    switch (getMimeGroup(mime)) {

        case 'image':
            return `<img data-item-preview data-id="${id}" draggable="false" title="${title}" alt="${escapeHtml(item.alt ?? item.title ?? '')}" src="${url}" loading="lazy" decoding="async"${item.width && item.height ? ` width="${Number(item.width)}" height="${Number(item.height)}"` : ''}>`;

        case 'video':
            return `<video data-item-preview data-id="${id}" ${controls ? 'controls' : ''} draggable="false" title="${title}" src="${url}" preload="metadata"></video>`;

        case 'audio':
            return `<audio data-item-preview data-id="${id}" ${controls ? 'controls' : ''} draggable="false" title="${title}" src="${url}" preload="metadata"></audio>`;

        default:
            return `<div data-item-preview data-id="${id}" title="${title}" class="media-fallback"><div class="icon-box"><span data-item-icon class="icon">${getMimeIcon(mime)}</span><span data-item-mime class="mime">${escapeHtml(mime)}</span></div><span data-item-name class="name">${title || '-'}</span></div>`;
    }
}
