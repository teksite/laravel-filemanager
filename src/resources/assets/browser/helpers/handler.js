export default async function handler({resolve, reject, final}) {
    try {
        const data = await resolve();

        return {success: true, data, error: null};
    } catch (error) {
        const data = reject ? await reject(error) : null;
        return {success: false, data, error};
    } finally {
        await final?.();
    }
}
