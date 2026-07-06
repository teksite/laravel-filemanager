export default class CallApi {

    constructor(requestService, options = {} ,baseUrl ='/api/filemanager') {

        this.request = requestService;

        this.options = {base: baseUrl, ...options};
    }

    /**
     * Build list query (cursor-based pagination)
     */
    list(params = {}) {
        return this.request.get(this.options.base, {
            type: 'cursor',
            cursor: params.cursor ?? null,
            disk: params.disk ?? '',
            mime_type: params.mimeType ?? ''
        });
    }

    /**
     * Upload file
     */
    upload(file, disk = null) {
        const form = new FormData();
        form.append('file', file);
        if (disk) {
            form.append('disk', disk);
        }
        return this.request.post(this.options.base, form, {
            headers: {} // allow browser to set multipart boundary
        });
    }

    /**
     * Update file metadata (e.g title)
     */
    update(id, data = {}) {

        return this.request.patch(`${this.options.base}/${id}`, data);
    }

    /**
     * Delete file
     */
    delete(id) {

        return this.request.delete(`${this.options.base}/${id}`);
    }

    /**
     * Get single file (optional future use)
     */
    find(id) {

        return this.request.get(`${this.options.base}/${id}`);
    }
}
