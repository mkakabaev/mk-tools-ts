//
export function delay(ms: number, callback?: () => void): Promise<void> {
    return new Promise((resolve, rejected) => {
        setTimeout(() => {
            if (callback) {
                try {
                    callback();
                    resolve();
                } catch (e) {
                    rejected(e);
                }
            } else {
                resolve();
            }
        }, ms);
    });
}