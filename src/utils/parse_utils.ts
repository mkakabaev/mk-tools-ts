import { MKError } from '../types/error';
import { stringify } from './string_utils';

// ------------------------------------------------------------------------------------------------

export function literalToType<T>(v: unknown, literals: readonly string[], options?: { tag?: string }): T {
    const v1 = literals.find((l) => l === v);
    if (v1 == undefined) {
        throw new MKError(`${stringify(v)} must be one of the [${literals.map((l) => `'${l}'`)}]`, {
            code: MKError.Code.badData,
            ...options,
        });
    }
    return v1 as any as T;
}

export function requiredString(v: any, options?: { tag?: string; defaultValue?: string }): string {
    if (v == null) {
        const defaultValue = options?.defaultValue;
        if (defaultValue != null) {
            return defaultValue;
        }
    }

    if (typeof v === 'string') {
        return v;
    }
    throw new MKError(`${stringify(v)} is not a string`, { code: MKError.Code.badData, ...options });
}

export function requiredNonEmptyString(v: any, options?: { tag?: string }): string {
    if (typeof v === 'string' && v.length) {
        return v;
    }
    throw new MKError(`${stringify(v)} is not a non-empty string`, { code: MKError.Code.badData, ...options });
}

export function requiredArray<T>(v: any, options?: { tag?: string; minLength?: number }): T[] {
    if (!Array.isArray(v)) {
        throw new MKError(`${stringify(v)} is not an array`, { code: MKError.Code.badData, ...options });
    }

    if (options?.minLength != null) {
        if (v.length < options.minLength) {
            throw new MKError(`The array must contains at least ${options.minLength} element(s)`, {
                code: MKError.Code.badData,
                ...options,
            });
        }
    }

    return v;
}

export function requiredBool(
    v: any,
    options?: {
        tag?: string;
    },
): boolean {
    if (typeof v === 'boolean') {
        return v;
    }
    throw new MKError(`${stringify(v)} is not a boolean`, { code: MKError.Code.badData, ...options });
}

// ------------------------------------------------------------------------------------------------

const _integerPattern = new RegExp('^[+-]?[0-9]{1,15}$'); // There will be rounding after 15 symbols and/or literal number precision loss (actually, > 2^53)
const _floatPattern = new RegExp('^[+-]?[0-9]{1,15}([.][0-9]{0,15})?$');

// ------------------------------------------------------------------------------------------------

export function requiredInt(
    v: any,
    options: {
        minValue?: number;
        maxValue?: number;
        tag?: string;
        defaultValue?: number;
    } = {},
): number {
    const { defaultValue, minValue, maxValue } = options;

    if (v == null) {
        if (defaultValue != null) {
            return defaultValue;
        }
    }

    let result: number;
    if (typeof v == 'number') {
        if (Number.isSafeInteger(v)) {
            result = Math.floor(v); // just in case, throw away minor fractions
            if (result !== v) {
                throw new MKError(`Bad value: '${v}' is a float (an integer is required)`, {
                    code: MKError.Code.badData,
                    ...options,
                });
            }
        } else {
            throw new MKError(`Bad value: '${v}' does not look like a safe integer`, {
                code: MKError.Code.badData,
                ...options,
            });
        }
    } else if (typeof v == 'string') {
        if (_integerPattern.test(v)) {
            result = parseInt(v);
        } else {
            throw new MKError(`Bad value: '${v}' does not look like a valid integer string`, {
                code: MKError.Code.badData,
                ...options,
            });
        }
    } else {
        throw new MKError(`Bad value: '${stringify(v)}' does not look like a valid integer`, {
            code: MKError.Code.badData,
            ...options,
        });
    }

    if (minValue != undefined) {
        if (minValue > result) {
            throw new MKError(`Value is out of range: the '${result}' value must not be less than ${minValue}`, {
                code: MKError.Code.outOfRange,
                ...options,
            });
        }
    }

    if (maxValue != undefined) {
        if (maxValue < result) {
            throw new MKError(`Value is out of range: the '${result}' value must not be greater than ${maxValue}`, {
                code: MKError.Code.outOfRange,
                ...options,
            });
        }
    }
    return result;
}

// ------------------------------------------------------------------------------------------------

export function requiredFloat(
    v: any,
    options: {
        minValue?: number;
        maxValue?: number;
        tag?: string;
        defaultValue?: number;
    } = {},
): number {
    const { defaultValue, minValue, maxValue } = options;

    if (v == null) {
        if (defaultValue != null) {
            return defaultValue;
        }
    }

    let result: number;
    if (typeof v == 'number') {
        if (Number.isFinite(v)) {
            result = v;
        } else {
            throw new MKError(`Bad value: '${v}' does not look like a finite integer`, {
                code: MKError.Code.badData,
                ...options,
            });
        }
    } else if (typeof v == 'string') {
        if (_floatPattern.test(v)) {
            result = parseFloat(v);
        } else {
            throw new MKError(`Bad value: '${v}' does not look like a valid float string`, {
                code: MKError.Code.badData,
                ...options,
            });
        }
    } else {
        throw new MKError(`Bad value: '${stringify(v)}' does not look like a valid float`, {
            code: MKError.Code.badData,
            ...options,
        });
    }

    if (minValue != undefined) {
        if (minValue > result) {
            throw new MKError(`Value is out of range: the '${result}' value must not be less than ${minValue}`, {
                code: MKError.Code.outOfRange,
                ...options,
            });
        }
    }

    if (maxValue != undefined) {
        if (maxValue < result) {
            throw new MKError(`Value is out of range: the '${result}' value must not be greater than ${maxValue}`, {
                code: MKError.Code.outOfRange,
                ...options,
            });
        }
    }
    return result;
}
