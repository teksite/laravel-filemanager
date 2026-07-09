import {getMimeGroup, getMimeIcon} from "./mime.js";
import {escapeHtml} from "./dom.js";

export function renderMedia(item){
    if (!item) return;
    const mime = item.mime_type ?? '';

    const type = getMimeGroup(mime);
const title = item.title ?? item.original_name ?? '';
    switch (type) {

        case 'image':
            return ` <img title="${title}" alt="title" src="${item.url}" loading="lazy" alt="${escapeHtml(title)}" >`;

        case 'video':
            return `<video title="${title}" src="${item.url}" preload="metadata"></video>`;

        case 'audio':
            return `<audio title="${title}" src="${item.url}" preload="metadata"></audio>`;

        default:
            return `<div title="${title}" class="media-fallback"><div class="icon-box"><span class="icon">${getMimeIcon(mime)}</span><span class="mime">${item.mime_type}</span></div><span class="name">${item.title ?? item.original_name ?? '-' }</span></span></div>`;
    }
}
