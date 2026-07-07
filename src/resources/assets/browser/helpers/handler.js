
async function handler({resolve, reject, final}) {
    try {
        const data = await resolve();
        return {success: true, data, error: null};
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        let data = null;

        if (reject) {
            data = await reject(err);
        }
        return {success: false, data, error: err};
    } finally {
        final?.();
    }
}

export default handler;
