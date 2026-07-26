/**
 * Extract primary mime type group
 * image/jpeg -> image
 */
export function getMimeGroup(mime = '') {

    if (!mime || typeof mime !== 'string') return 'unknown';

    return mime.split('/')[0]?.toLowerCase() || 'unknown';
}

/**
 * Check if file is image
 */
export function isImage(mime) {
    return getMimeGroup(mime) === 'image';
}

/**
 * Check if file is video
 */
export function isVideo(mime) {
    return getMimeGroup(mime) === 'video';
}

/**
 * Check if file is audio
 */
export function isAudio(mime) {
    return getMimeGroup(mime) === 'audio';
}

/**
 * Check if file is document (pdf, text, etc future-proof)
 */
export function isDocument(mime) {
    const group = getMimeGroup(mime);

    return group === 'application';


}

/**
 * Get human-readable label
 */
export function getMimeLabel(mime = '') {

    const group = getMimeGroup(mime);

    switch (group) {
        case 'image': return 'Image';
        case 'video': return 'Video';
        case 'audio': return 'Audio';
        case 'application': return 'Document';
        default: return 'Unknown';
    }
}

/**
 * Get icon for UI rendering
 */
export function getMimeIcon(mime = '') {

    const group = getMimeGroup(mime);

    switch (group) {
        case 'image':
            return '🖼️';

        case 'video':
            return '🎬';

        case 'audio':
            return '🎵';

        case 'text':
            return '📄';

        case 'pdf':
            return '📕';

        case 'word':
            return '📘';

        case 'excel':
            return '📗';

        case 'powerpoint':
            return '📙';

        case 'archive':
            return '🗜️';

        case 'code':
            return '💻';

        case 'font':
            return '🔤';

        case 'ebook':
            return '📚';

        case 'database':
            return '🗃️';

        case 'vector':
            return '🎨';

        case 'certificate':
            return '🔐';

        case 'application':
            return '⚙️';

        case 'folder':
            return '📁';

        default:
            return '📦';
    }
}
