
export function extractMessage(error: unknown): string {
    if (error == null) {
        return "??";
    }

    if (error instanceof(Error)) {
        return error.message;
    }

    const message = (error as any).message;
    if (message) {
        return message;
    }

    return `${error}`;
}
