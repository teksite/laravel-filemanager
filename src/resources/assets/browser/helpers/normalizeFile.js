export default function normalizeFile(files) {
    if (!files) return {};

    const list = Array.isArray(files) ? files : [files];

    return list.reduce((result, file) => {
        if (!file?.id) return result;

        result[file.id] = file;

        return result;
    }, {});
}
