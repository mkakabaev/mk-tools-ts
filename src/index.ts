import { config } from './utils/parse_utils';
import { TagLike } from './types/tag';
import { MKError } from './types/error';

export * from './types/date';
export * from './types/duration';
export * from './types/error';
export * from './types/tag';
export * from './types/to_string_builder';
export * from './utils/parse_utils';
export * from './utils/error_utils';
export * from './utils/stringify';
export * from './utils/delay';

// Here we assign all defaults (assemble)

// parser error function. Use MKError as a default
if (!config.errorFunction) {
    config.errorFunction = (message: string, options?: { tag?: TagLike}): Error => {
        return new MKError(message, {
            code: MKError.Code.invalidFormat,
            ...options,
        });
    };
}