import {getMimeGroup, getMimeIcon} from "./mime.js";
import {escapeHtml} from "./dom.js";

export function renderMedia(item, controls = false) {

    if (!item?.id) return;

    const mime = item.mime_type ?? '';

    const type = getMimeGroup(mime);

    const title = item.title ?? item.original_name ?? '';

    const id = item.id ?? '';

    switch (type) {

        case 'image':
            return `<img data-item-preiewe data-id="${id}" draggable="false"  title="${title}" alt="title" src="${item.url}" loading="lazy" alt="${escapeHtml(title)}" >`;

        case 'video':
            return `<video data-item-preiew data-id="${id}" ${controls ? 'controls' : ''} draggable="false"  title="${title}" src="${item.url}" preload="metadata"></video>`;

        case 'audio':
            return `<audio data-item-preiew data-id="${id}" ${controls ? 'controls' : ''} draggable="false"  title="${title}" src="${item.url}" preload="metadata"></audio>`;

        default:
            return `<div data-item-preiew data-id="${id}" title="${title}" class="media-fallback"><div class="icon-box"><span data-item-icon class="icon">${getMimeIcon(mime)}</span><span data-item-min class="mime">${item.mime_type}</span></div><span data-item-name class="name">${item.title ?? item.original_name ?? '-'}</span></span></div>`;
    }
}
