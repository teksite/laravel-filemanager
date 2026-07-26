/**
 * Convert bytes to human readable format
 *
 * @param {number} bytes
 * @param {number} decimals
 * @returns {string}
 */
export default function formatSize(bytes, decimals = 1) {

    if (bytes === null || bytes === undefined || isNaN(bytes)) {
        return '0 B';
    }

    const size = Number(bytes);

    if (size <= 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

    const k = 1024;

    const i = Math.floor(Math.log(size) / Math.log(k));

    const safeIndex = Math.min(i, units.length - 1);

    const value = size / Math.pow(k, safeIndex);

    return `${value.toFixed(decimals)} ${units[safeIndex]}`;
}
