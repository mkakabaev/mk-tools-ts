import { ToStringBuilder } from './to_string_builder';
import { Tag, TagLike } from './tag';

// ------------------------------------------------------------------------------------------------

// Patch Error to be able to serialize it
// https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify

/*
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
*/

// ------------------------------------------------------------------------------------------------

export class MKError extends Error {
    readonly code?: string | number;
    readonly subcode?: string | number;
    readonly tag?: Tag;

    constructor(message: string, options?: MKErrorOptions) {
        const sb = new ToStringBuilder('');
        sb.add('code', options?.code);
        sb.add('subcode', options?.subcode);
        sb.add('tag', options?.tag);

        super(message);

        this.code = options?.code;
        this.subcode = options?.subcode;
        this.tag = Tag.resolve(options?.tag);
    }

    override toString(): string {
        return this.message;
    }
}

// ------------------------------------------------------------------------------------------------

export type MKErrorOptions = {
    tag?: TagLike;
    code?: string | number;
    subcode?: string | number;
};
