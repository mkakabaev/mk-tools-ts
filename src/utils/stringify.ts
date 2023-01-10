export function stringify(v: any): string {
    if (v === undefined) {
        return '<undefined>';
    }
    if (v === null) {
        return '<null>';
    }
    if (typeof v === 'string') {
        return `'${v}'`;
    }
    if (typeof v === 'boolean') {
        return `<${v}>`;
    }
    let result = `${v}`;
    if (result === '[object Object]') {
        if (v instanceof Object) {
            result = JSON.stringify(v);
        }
    }
    return result;
}
