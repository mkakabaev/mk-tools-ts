
export function extractMessage(error: unknown): string {
    if (error instanceof(Error)) {
        return error.message;
    }
    return `${error}`;
}
