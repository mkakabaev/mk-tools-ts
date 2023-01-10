import { TagLike } from '../types/tag';
import { stringify } from './stringify';

// ------------------------------------------------------------------------------------------------

//
// Make parse error customizable. By default this is set to MKError in the index
// (as soon as library is used as is)
//

export type ErrorFunction = (message: string, options?: { tag?: TagLike }) => Error;

export const config: {
    errorFunction?: ErrorFunction | undefined;
} = {};

// ------------------------------------------------------------------------------------------------

function _throwErr(message: string, options?: { tag?: TagLike }): never {
    const f = config.errorFunction;
    if (!f) {
        throw `No error function configured the parser (${message})`;
    }
    throw f(message, options);
}

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
export function requiredLiteralType<T>(v: unknown, literals: readonly T[], options?: { tag?: TagLike }): T {
    const v1 = literals.find((l) => l === v);
    if (v1 == undefined) {
        _throwErr(`${stringify(v)} must be one of the [${literals.map((l) => `'${l}'`)}]`, options);
    }
    return v1 as any as T;
}

export function definedObject(v: any, options?: { path?: string[]; tag?: TagLike }): any {
    let result = v;

    if (result === undefined) {
        _throwErr(`${stringify(v)} is not defined`, options);
    }

    const path = options?.path;
    if (path != null) {
        for (const p of path) {
            result = result[p];
            if (result === undefined) {
                _throwErr(`${stringify(v)} has no defined child at path ${path.join('/')}`, options);
            }
        }
    }

    if (result === null || typeof result != 'object') {
        _throwErr(`${stringify(v)} is not an object`, options);
    }

    return result;
}

export function optionalString(v: any, options?: { tag?: TagLike; acceptNumber?: boolean }): string | undefined {
    if (v == null) {
        return undefined;
    }

    if (typeof v === 'string') {
        return v;
    }

    if (options?.acceptNumber ?? false) {
        if (typeof v === 'number') {
            return v.toString();
        }
    }

    _throwErr(`${stringify(v)} is not a string`, options);
}

export function requiredString(
    v: any,
    options?: { tag?: TagLike; defaultValue?: string; acceptNumber?: boolean },
): string {
    if (v == null) {
        const defaultValue = options?.defaultValue;
        if (defaultValue != null) {
            return defaultValue;
        }
    }

    if (typeof v === 'string') {
        return v;
    }

    if (options?.acceptNumber ?? false) {
        if (typeof v === 'number') {
            return v.toString();
        }
    }

    _throwErr(`${stringify(v)} is not a string`, options);
}

export function requiredNonEmptyString(v: any, options?: { tag?: TagLike; acceptNumber?: boolean }): string {
    if (typeof v === 'string' && v.length) {
        return v;
    }

    if (options?.acceptNumber ?? false) {
        if (typeof v === 'number') {
            return v.toString();
        }
    }

    _throwErr(`A non-empty string is expected, found ${stringify(v)}`, options);
}

export function requiredArray<T>(v: any, options?: { tag?: TagLike; minLength?: number; defaultValue?: T[] }): T[] {
    if (v == null) {
        const defaultValue = options?.defaultValue;
        if (defaultValue != null) {
            return defaultValue;
        }
    }

    if (!Array.isArray(v)) {
        _throwErr(`${stringify(v)} is not an array`, options);
    }

    if (options?.minLength != null) {
        if (v.length < options.minLength) {
            _throwErr(`The array must contains at least ${options.minLength} element(s)`, options);
        }
    }

    return v;
}

export function requiredBool(
    v: any,
    options?: {
        tag?: TagLike;
    },
): boolean {
    if (typeof v === 'boolean') {
        return v;
    }
    _throwErr(`${stringify(v)} is not a boolean`, options);
}

// ------------------------------------------------------------------------------------------------

const _integerPattern = new RegExp('^[+-]?[0-9]{1,15}$'); // There will be rounding after 15 symbols and/or literal number precision loss (actually, > 2^53)
const _floatPattern = new RegExp('^[+-]?[0-9]{1,15}([.][0-9]{0,15})?$');

// ------------------------------------------------------------------------------------------------

export function requiredInt(
    v: any,
    options?: {
        minValue?: number;
        maxValue?: number;
        tag?: TagLike;
        defaultValue?: number;
    },
): number {
    if (v == null) {
        if (options?.defaultValue != null) {
            return options.defaultValue;
        }
    }

    let result: number;
    if (typeof v == 'number') {
        if (Number.isSafeInteger(v)) {
            result = Math.floor(v); // just in case, throw away minor fractions
            if (result !== v) {
                _throwErr(`${v} is a float value (an integer is required)`, options);
            }
        } else {
            _throwErr(`${v} does not look like a safe integer`, options);
        }
    } else if (typeof v == 'string') {
        if (_integerPattern.test(v)) {
            result = parseInt(v);
        } else {
            _throwErr(`${stringify(v)} does not look like a valid integer string`, options);
        }
    } else {
        _throwErr(`${stringify(v)} does not look like a valid integer`, options);
    }

    const minValue = options?.minValue;
    if (minValue != undefined) {
        if (minValue > result) {
            _throwErr(`Value is out of range: the '${result}' value must not be less than ${minValue}`, options);
        }
    }

    const maxValue = options?.maxValue;
    if (options?.maxValue != undefined) {
        if (options?.maxValue < result) {
            _throwErr(`Value is out of range: the '${result}' value must not be greater than ${maxValue}`, options);
        }
    }
    return result;
}

// ------------------------------------------------------------------------------------------------

export function optionalInt(
    v: any,
    options?: {
        minValue?: number;
        maxValue?: number;
        tag?: TagLike;
    },
): number | undefined {
    if (v == null) {
        return undefined;
    }
    return requiredInt(v, options);
}

// ------------------------------------------------------------------------------------------------

export function requiredFloat(
    v: any,
    options: {
        minValue?: number;
        maxValue?: number;
        tag?: TagLike;
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
            _throwErr(`${v} does not look like a finite number`, options);
        }
    } else if (typeof v == 'string') {
        if (_floatPattern.test(v)) {
            result = parseFloat(v);
        } else {
            _throwErr(`${stringify(v)} does not look like a valid float string`, options);
        }
    } else {
        _throwErr(`${stringify(v)} does not look like a valid float value`, options);
    }

    if (minValue != undefined) {
        if (minValue > result) {
            _throwErr(`Value is out of range: ${result} must be greater than or equal to ${minValue}`, options);
        }
    }

    if (maxValue != undefined) {
        if (maxValue < result) {
            _throwErr(
                `Value is out of range: the '${result}' value must be less than or equal to ${maxValue}`,
                options,
            );
        }
    }
    return result;
}
