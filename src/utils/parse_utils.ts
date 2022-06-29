import { MKError } from '../types';
import { stringify } from './string_utils';

// ------------------------------------------------------------------------------------------------

/**
 * 
 * Works best with unions, string literal types
 * ```
 *   const MyLiterals = [ 'value1', 'value2', 100 ] as const;
 *   type MyType = typeof MyLiterals[number]; // MyType = 'value1' | 'value2' | 100;
 *
 *   const typedVar: MyType = requiredLiteralType(someValue, MyLiterals) 
 * 
 *   // works also but breaks further `switch-exhaustiveness-check` eslint checking
 *   const typedVar = requiredLiteralType(someValue, MyLiterals)   
 * ```
 * 
 * inplace declaration is also possible
 * ```
 *   const someValue = "aaa"
 *   var typedVar  = requiredLiteralType(someValue, [ 'value1', 'value2', 100 ] as const) 
 *   var typedVar2 = requiredLiteralType(someValue, [ 'value1', 'value2', 100 ]) 
 *   
 *   typedVar = "value1" // ok
 *   typedVar = "string" // compiler error 
 *   typedVar = 300      // compiler error 
 *   
 *   typedVar2 = "value1" // ok
 *   typedVar2 = "string" // ok 
 *   typedVar2 = 300      // ok
 * ```
 */
export function requiredLiteralType<T>(v: unknown, literals: readonly T[], options?: { tag?: string }): T {
    const v1 = literals.find((l) => l === v);
    if (v1 == undefined) {
        throw new MKError(`${stringify(v)} must be one of the [${literals.map((l) => `'${l}'`)}]`, {
            code: MKError.Code.invalidFormat,
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
    throw new MKError(`${stringify(v)} is not a string`, { code: MKError.Code.invalidFormat, ...options });
}

export function requiredNonEmptyString(v: any, options?: { tag?: string }): string {
    if (typeof v === 'string' && v.length) {
        return v;
    }
    throw new MKError(`${stringify(v)} is not a non-empty string`, { code: MKError.Code.invalidFormat, ...options });
}

export function requiredArray<T>(v: any, options?: { tag?: string; minLength?: number }): T[] {
    if (!Array.isArray(v)) {
        throw new MKError(`${stringify(v)} is not an array`, { code: MKError.Code.invalidFormat, ...options });
    }

    if (options?.minLength != null) {
        if (v.length < options.minLength) {
            throw new MKError(`The array must contains at least ${options.minLength} element(s)`, {
                code: MKError.Code.invalidFormat,
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
    throw new MKError(`${stringify(v)} is not a boolean`, { code: MKError.Code.invalidFormat, ...options });
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
                throw new MKError(`Invalid value format: ${v} is a float (an integer is required)`, {
                    code: MKError.Code.invalidFormat,
                    ...options,
                });
            }
        } else {
            throw new MKError(`Invalid value format: ${v} does not look like a safe integer`, {
                code: MKError.Code.invalidFormat,
                ...options,
            });
        }
    } else if (typeof v == 'string') {
        if (_integerPattern.test(v)) {
            result = parseInt(v);
        } else {
            throw new MKError(`Invalid value format: '${v}' does not look like a valid integer string`, {
                code: MKError.Code.invalidFormat,
                ...options,
            });
        }
    } else {
        throw new MKError(`Invalid value format: ${stringify(v)} does not look like a valid integer`, {
            code: MKError.Code.invalidFormat,
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
            throw new MKError(`Invalid value format: ${v} does not look like a finite integer`, {
                code: MKError.Code.invalidFormat,
                ...options,
            });
        }
    } else if (typeof v == 'string') {
        if (_floatPattern.test(v)) {
            result = parseFloat(v);
        } else {
            throw new MKError(`Invalid value format: '${v}' does not look like a valid float string`, {
                code: MKError.Code.invalidFormat,
                ...options,
            });
        }
    } else {
        throw new MKError(`Invalid value format: ${stringify(v)} does not look like a valid float`, {
            code: MKError.Code.invalidFormat,
            ...options,
        });
    }

    if (minValue != undefined) {
        if (minValue > result) {
            throw new MKError(`Value is out of range: ${result} must be greater than or equal to ${minValue}`, {
                code: MKError.Code.outOfRange,
                ...options,
            });
        }
    }

    if (maxValue != undefined) {
        if (maxValue < result) {
            throw new MKError(
                `Value is out of range: the '${result}' value must be less than or equal to ${maxValue}`,
                {
                    code: MKError.Code.outOfRange,
                    ...options,
                },
            );
        }
    }
    return result;
}
