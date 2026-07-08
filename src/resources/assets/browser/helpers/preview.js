import {getMimeGroup, getMimeIcon} from "./mime.js";
import {escapeHtml} from "./dom.js";

export function renderMedia(item){
    if (!item) return;
    const mime = item.mime_type ?? '';

    const type = getMimeGroup(mime);

    switch (type) {

        case 'image':
            return ` <img src="${item.url}" loading="lazy" alt="${escapeHtml(item.title ?? item.original_name ?? '')}" >`;

        case 'video':
            return `<video src="${item.url}" preload="metadata"></video>`;

        case 'audio':
            return `<audio src="${item.url}" preload="metadata"></audio>`;

        default:
            return `<div class="media-fallback"><div class="icon-box"><span class="icon">${getMimeIcon(mime)}</span><span class="mime">${item.mime_type}</span></div><span class="name">${item.title ?? item.original_name ?? '-' }</span></span></div>`;
    }
}
