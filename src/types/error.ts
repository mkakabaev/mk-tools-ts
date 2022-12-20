import { ToStringBuilder } from './to_string_builder';
import { extractErrorMessage } from '../utils/error_utils';
import { Tag, TagLike } from './tag';

// ------------------------------------------------------------------------------------------------

// Patch Error to be able to serialize it
// https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify

if (!('toJSON' in Error.prototype)) {
    Object.defineProperty(Error.prototype, 'toJSON', {
        value: function () {
            const alt = {} as any;

            Object.getOwnPropertyNames(this).forEach((key) => {
                alt[key] = this[key];
            }, this);

            return alt;
        },
        configurable: true,
        writable: true,
    });
}

// ------------------------------------------------------------------------------------------------

export class MKError extends Error {
    readonly code?: string | number;
    readonly domain?: string;
    readonly tag?: Tag;
    readonly description: string;
    readonly isPrivate: boolean;
    readonly details?: string[];

    constructor(message: string, options?: MKError.Options) {
        const sb = new ToStringBuilder('');
        sb.add('domain', options?.domain);
        sb.add('code', options?.code);
        sb.add('tag', options?.tag);
        const postfix = sb.toString();

        let fullMessage = message;
        if (options?.details) {
            if (!fullMessage.endsWith('.')) {
                fullMessage += '.';
            }
            fullMessage += ` Details: ${options.details.join('; ')}`;
        }
        if (postfix) {
            if (!fullMessage.endsWith('.')) {
                fullMessage += '.';
            }
            fullMessage += ` (${postfix})`;
        }
        super(fullMessage);

        this.description = message;
        this.code = options?.code;
        this.domain = options?.domain;
        this.tag = Tag.resolve(options?.tag);
        this.details = options?.details;
        this.isPrivate = options?.isPrivate ?? false;
    }

    override toString(): string {
        return this.message;
    }

    static rethrow(e: unknown, message: string, options?: MKError.Options): never {
        // Special processing for MKError: inherit options, use original message
        if (e instanceof MKError) {
            throw new MKError(`${message}: ${e.description}`, { ...e, ...options });
        }

        throw new MKError(`${message}: ${extractErrorMessage(e)}`, options);
    }
}

// ------------------------------------------------------------------------------------------------

export namespace MKError {
    export interface Options {
        tag?: TagLike;
        code?: string | number;
        domain?: string;
        isPrivate?: boolean;
        details?: string[];
    }

    /** Few standard codes */
    export enum Code {
        notFound = 'not_found',
        invalidFormat = 'invalid_format', 
        alreadyExists = 'already_exists',
        outOfRange = 'out_of_range',
    }
}
