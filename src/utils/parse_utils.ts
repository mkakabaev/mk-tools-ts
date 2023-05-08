import { MKSimpleDate } from '../types/simple_date';
import { TagLike, TagValue } from '../types/tag';
import { extractErrorMessage } from './error_utils';
import { stringify } from './stringify';

// ------------------------------------------------------------------------------------------------

//
// Make parse error customizable. By default this is set to MKError in the index
// (as soon as library is used as is)
//

export type ParseOptions = {
    tag?: TagLike;
    tagNext?: TagValue;
    code?: string;
    subcode?: string;
};

export type ErrorOptions = ParseOptions;

export type ErrorFunction = (message: string, options?: ErrorOptions) => Error;

export const config: { errorFunction?: ErrorFunction } = {};

// ------------------------------------------------------------------------------------------------

function _throwErr(message: string, options?: ErrorOptions): never {
    const f = config.errorFunction;
    if (!f) {
        throw `No error function configured the parser (${message})`;
    }
    throw f(message, options);
}

// ------------------------------------------------------------------------------------------------

/** Just to narrow options */
export function makeRequired<T, O>(f: (v: T, options?: O) => T): (v: T, options?: O) => T {
    return f;
}

export function makeOptional<T, O>(f: (v: T, options?: O) => T): (v: T | undefined, options?: O) => T | undefined {
    return (v: T | undefined, options?: O) => {
        if (v == null) {
            return undefined;
        }
        return f(v, options);
    };
}

export function makeNullable<T, O>(f: (v: T, options?: O) => T): (v: T | null, options?: O) => T | null {
    return (v: T | null, options?: O) => {
        if (v == null) {
            return null;
        }
        return f(v, options);
    };
}

export function makeOptionalNullable<T, O>(
    f: (v: T, options?: O) => T,
): (v: T | null | undefined, options?: O) => T | null | undefined {
    return (v: T | undefined | null, options?: O) => {
        if (v === null) {
            return null;
        }
        if (v === undefined) {
            return null;
        }
        return f(v, options);
    };
}

// ------------------------------------------------------------------------------------------------

export function makeOptionalLiteral<T, O>(
    f: (v: T, literals: readonly T[], options?: O) => T,
): (v: T | undefined, literals: readonly T[], options?: O) => T | undefined {
    return (v: T | undefined, literals: readonly T[], options?: O) => {
        if (v == null) {
            return undefined;
        }
        return f(v, literals, options);
    };
}

export function makeNullableLiteral<T, O>(
    f: (v: T, literals: readonly T[], options?: O) => T,
): (v: T | null, literals: readonly T[], options?: O) => T | null {
    return (v: T | null, literals: readonly T[], options?: O) => {
        if (v == null) {
            return null;
        }
        return f(v, literals, options);
    };
}

export function makeOptionalNullableLiteral<T, O>(
    f: (v: T, literals: readonly T[], options?: O) => T,
): (v: T | null | undefined, literals: readonly T[], options?: O) => T | null | undefined {
    return (v: T | undefined | null, literals: readonly T[], options?: O) => {
        if (v === null) {
            return null;
        }
        if (v === undefined) {
            return null;
        }
        return f(v, literals, options);
    };
}

// ------------------------------------------------------------------------------------------------

/**
 *
 * Works best with unions, string literal types
 * ```
 *   const MyLiterals = [ 'value1', 'value2', 100 ] as const;
 *   type MyType = typeof MyLiterals[number]; // MyType = 'value1' | 'value2' | 100;
 *
 *   const typedVar: MyType = requiredLiteral(someValue, MyLiterals)
 *
 *   // works also but breaks further `switch-exhaustiveness-check` eslint checking
 *   const typedVar = requiredLiteral(someValue, MyLiterals)
 * ```
 *
 * inplace declaration is also possible
 * ```
 *   const someValue = "aaa"
 *   var typedVar  = requiredLiteral(someValue, [ 'value1', 'value2', 100 ] as const)
 *   var typedVar2 = requiredLiteral(someValue, [ 'value1', 'value2', 100 ])
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
export function requiredLiteral<T extends string | number>(
    v: T,
    literals: readonly T[],
    options?: ParseOptions & { detailedError?: boolean },
): T {
    const v1 = v == undefined ? undefined : literals.find((l) => l === v);

    if (v1 == undefined) {
        if (options?.detailedError) {
            _throwErr(
                `${v == undefined ? 'Missed' : 'Wrong '} value (one of the [${literals.map(
                    (l) => `'${l}'`,
                )}] is expected)`,
                options,
            );
            _throwErr(`${stringify(v)} must be one of the [${literals.map((l) => `'${l}'`)}]`, options);
        } else {
            _throwErr(`${v == undefined ? 'Missed' : 'Wrong '} value`, options);
        }
    }
    return v1;
}

export const optionalLiteral = makeOptionalLiteral(requiredLiteral);
export const nullableLiteral = makeNullableLiteral(requiredLiteral);
export const optionalNullableLiteral = makeOptionalNullableLiteral(requiredLiteral);

// ------------------------------------------------------------------------------------------------

export function definedObject<T = Record<string, any>>(v: any, options?: { path?: string[] } & ParseOptions): T {
    let result = v;

    if (result === undefined) {
        _throwErr(`Missed object`, options);
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

// ------------------------------------------------------------------------------------------------

/*
mk: does not work properly with nullable, optional, optionalNullable

export function f1<T extends string>(v: T | number, options: { defaultValue?: T; acceptNumber: true } & Options): T;
export function f1<T extends string>(v: T, options: { defaultValue?: T; acceptNumber: false } & Options): T;
export function f1<T extends string>(v: T, options?: { defaultValue?: T } & Options): T;
export function f1<T extends string>(v: T, options?: { defaultValue?: T } & Options): T {
    console.log(options);
    return v;
}

const ff11 = f1('a', { acceptNumber: true });
const ff12 = f1(122, { acceptNumber: true });
const ff13 = nullableF1(null, { acceptNumber: true });
const ff13 = optionalF1(undefined, { acceptNumber: true });

const ff21 = f1('a', { acceptNumber: false });
const ff22 = f1(123, { acceptNumber: false });
const ff23 = nullableF1(null, { acceptNumber: false });
const ff2 = optionalF1(undefined, { acceptNumber: false });

const ff31 = f1('a', {} as Options);
const ff32 = f1(123, {  acceptNumber: true});
const ff34 = nullableF1(null, {  });
const ff35 = optionalF1(undefined, {  });

const ff41 = f1('a');
const ff52 = f1(123);

*/

export function requiredString<T extends string>(
    v: T | number | bigint,
    options?: { defaultValue?: T; acceptNumber?: boolean } & ParseOptions,
): T {
    if (v == null) {
        const defaultValue = options?.defaultValue;
        if (defaultValue != null) {
            return defaultValue;
        }
    }

    if (typeof v === 'string') {
        return v as T;
    }

    if (options?.acceptNumber ?? false) {
        if (typeof v === 'number' || typeof v === 'bigint') {
            return String(v) as T;
        }
    }

    if (v == null) {
        _throwErr(`Missed value (a string is expected)`, options);
    }

    _throwErr(`${stringify(v)} is not a string`, options);
}

export function nonEmptyString<T extends string>(
    v: T | number | bigint,
    options?: { acceptNumber?: boolean } & ParseOptions,
): T {
    const r = requiredString(v, options);
    if (r.length) {
        return r;
    }
    _throwErr(`A non-empty string is expected, found ${stringify(v)}`, options);
}

export const optionalString = makeOptional(requiredString);
export const nullableString = makeNullable(requiredString);
export const optionalNullableString = makeOptionalNullable(requiredString);

// ------------------------------------------------------------------------------------------------

export function requiredArray<T>(
    v: T[],
    options?: { minLength?: number; maxLength?: number; defaultValue?: T[] } & ParseOptions,
): T[] {
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
            _throwErr(
                `The array must contain at least ${options.minLength} element${options.minLength == 1 ? '' : 's'}`,
                options,
            );
        }
    }

    if (options?.maxLength != null) {
        if (v.length > options.maxLength) {
            _throwErr(
                `The array must contain not more than ${options.maxLength} element${options.minLength == 1 ? '' : 's'}`,
                options,
            );
        }
    }

    return v;
}

export const optionalArray = makeOptional(requiredArray);
export const nullableArray = makeNullable(requiredArray);
export const optionalNullableArray = makeOptionalNullable(requiredArray);

// ------------------------------------------------------------------------------------------------

const boolMap: Record<string, boolean> = {
    true: true,
    false: false,

    False: false,
    F: false,
    FALSE: false,
    TRUE: true,
    True: true,
    T: true,
};

export function requiredBool<T extends boolean>(v: T, options?: ParseOptions): T {
    if (typeof v === 'boolean') {
        return v as T;
    }
    if (typeof v === 'string') {
        const v1 = boolMap[v];
        if (v1 != null) {
            return v1 as T;
        }
    }
    if (v == null) {
        _throwErr(`Missed value (a boolean is expected)`, options);
    }
    _throwErr(`${stringify(v)} is not a boolean`, options);
}

export const optionalBool = makeOptional(requiredBool);
export const nullableBool = makeNullable(requiredBool);
export const optionalNullableBool = makeOptionalNullable(requiredBool);

// ------------------------------------------------------------------------------------------------

// There will be rounding after 15 symbols and/or literal number precision loss (actually, > 2^53)
const _integerPattern = new RegExp('^[+-]?[0-9]{1,15}$');
const _floatPattern = new RegExp('^[+-]?[0-9]{1,15}([.][0-9]{0,15})?$');

export function requiredInt<T extends number>(
    v: T,
    options?: {
        minValue?: T;
        maxValue?: T;
        defaultValue?: T;
    } & ParseOptions,
): T {
    if (v == null) {
        if (options?.defaultValue != null) {
            return options.defaultValue;
        }
    }

    let result: number;
    if (typeof v == 'number') {
        if (Number.isSafeInteger(v)) {
            // result = Math.floor(v); // just in case, throw away minor fractions
            // if (result !== v) {
            //    _throwErr(`${v} is a float value (an integer is required)`, options);
            // }
            result = v;
        } else {
            _throwErr(`${v} does not look like a true integer`, options);
        }
    } else if (typeof v == 'string') {
        if (_integerPattern.test(v)) {
            result = parseInt(v);
        } else {
            _throwErr(`${stringify(v)} does not look like a valid integer string`, options);
        }
    } else if (v == null) {
        _throwErr(`Missed value (an integer is expected)`, options);
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
    return result as T;
}

export const optionalInt = makeOptional(requiredInt);
export const nullableInt = makeNullable(requiredInt);
export const optionalNullableInt = makeOptionalNullable(requiredInt);

// ------------------------------------------------------------------------------------------------

export function requiredFloat<T extends number>(
    v: T,
    options?: {
        minValue?: T;
        maxValue?: T;
        defaultValue?: T;
    } & ParseOptions,
): T {
    const { defaultValue, minValue, maxValue } = options ?? {};

    if (v == null) {
        if (defaultValue != null) {
            return defaultValue as T;
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
    } else if (v == null) {
        _throwErr(`Missed value (a float number is expected)`, options);
    } else {
        _throwErr(`${stringify(v)} does not look like a valid float value`, options);
    }

    if (minValue != undefined) {
        if (minValue > result) {
            _throwErr(`Value is out of range: ${result} must be >= ${minValue}`, options);
        }
    }

    if (maxValue != undefined) {
        if (maxValue < result) {
            _throwErr(`Value is out of range: the ${result} value must be <= ${maxValue}`, options);
        }
    }
    return result as T;
}

export const optionalFloat = makeOptional(requiredFloat);
export const nullableFloat = makeNullable(requiredFloat);
export const optionalNullableFloat = makeOptionalNullable(requiredFloat);

// ------------------------------------------------------------------------------------------------

export function requiredSimpleDate<T extends MKSimpleDate>(v: T, options?: ParseOptions): T {
    if (v == null) {
        _throwErr(`Missed value (a timestamp is expected)`, options);
    }
    try {
        let d = NaN;
        if ('number' == typeof v) {
            d = v;
        } else if ((v as any) instanceof Date) {
            d = (v as Date).getTime();
        } else if ('string' == typeof v) {
            d = Date.parse(v);
        }
        if (isNaN(d)) {
            throw 'Neither a valid UNIX timestamp nor a string ready to Date.parse()';
        }

        // Check against reasonable values: 2020-01-01..2050-01-01.
        // Convert seconds to milliseconds,
        if (1577836800 <= d && d <= 2524608000) {
            d *= 1000;
        }

        if (d < 1577836800000 || d > 2524608000000) {
            throw 'Value is out of valid timestamp ranges';
        }

        return d as T;
    } catch (e) {
        _throwErr(`${stringify(v)} is not a valid date: ${extractErrorMessage(e)}`, options);
    }
}

export const optionalSimpleDate = makeOptional(requiredSimpleDate);
export const nullableSimpleDate = makeNullable(requiredSimpleDate);
export const optionalNullableSimpleDate = makeOptionalNullable(requiredSimpleDate);
