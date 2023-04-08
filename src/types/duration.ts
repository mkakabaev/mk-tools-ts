// ------------------------------------------------------------------------------------------------
// Helpers

function _pad2(value: number): string {
    return ('' + value).padStart(2, '0');
}

function _pad3(value: number): string {
    return ('' + value).padStart(3, '0');
}

// ------------------------------------------------------------------------------------------------
// Duration

export class MKDuration {
    private readonly durationMS: number;

    constructor(durationMS: number) {
        this.durationMS = durationMS;
    }

    get milliseconds(): number {
        return this.durationMS;
    }

    toString(format?: MKDuration.Format): string {
        const durationMS = this.durationMS;

        let prefix = '';
        let ms: any = Math.trunc(durationMS);
        if (ms < 0) {
            ms = -ms;
            prefix = '-';
        }

        switch (format ?? 'default') {
            case 'default': {
                const seconds = Math.trunc(ms / 1000) % 60;
                const minutes = Math.trunc(ms / 60000) % 60;
                const hours = Math.trunc(ms / 3600000);
                ms = ms % 1000;
                return prefix + hours + ':' + _pad2(minutes) + ':' + _pad2(seconds) + '.' + _pad3(ms);
            }

            case 'hms': {
                const seconds = Math.trunc(ms / 1000) % 60;
                const minutes = Math.trunc(ms / 60000) % 60;
                const hours = Math.trunc(ms / 3600000);
                return prefix + hours + ':' + _pad2(minutes) + ':' + _pad2(seconds);
            }

            case 'seconds': {
                const seconds = Math.trunc(ms / 1000);
                ms = ms % 1000;
                return prefix + seconds + '.' + _pad3(ms);
            }

            default:
                throw Error(`Unsupported duration format '${format}'`);
        }
    }
}

export namespace MKDuration {
    export type Format =
        | 'default' // 0:00:00.000
        | 'seconds' // 233.000
        | 'hms'; // 11:22:33
}
