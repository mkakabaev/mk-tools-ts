import { config, ErrorOptions } from './utils/parse_utils';
import { MKError } from './types/error';
import { Tag } from './types/tag';

export * from './types/date';
export * from './types/simple_date';
export * from './types/duration';
export * from './types/error';
export * from './types/tag';
export * from './types/misc';
export * from './types/to_string_builder';
export * from './utils/parse_utils';
export * from './utils/error_utils';
export * from './utils/stringify';
export * from './utils/delay';

// Here we assign all defaults (assemble)

// parser error function. Use MKError as a default
if (!config.errorFunction) {
    config.errorFunction = (message: string, options?: ErrorOptions): Error => {
        return new MKError(message, { ...options, tag: Tag.resolve(options?.tag, options?.tagNext)});
    };
}