import * as luxon from 'luxon';
import * as util from 'util';
import { MKDuration } from './duration';

// export function daysInMonth(options: { year: number, month: number /* starting 1 */ }): number {
//     return new Date(options.year, options.month, 0).getDate();
// }

// ------------------------------------------------------------------------------------------------

const _startDate = luxon.DateTime.now();
const _currentYear = _startDate.year;
const _currentYMD = _startDate.year * 10000 + _startDate.month * 100 + _startDate.day;

// ------------------------------------------------------------------------------------------------

export class MKDate {
    // luxon.DateTime always contains a time zone. By default the local time zone is used!
    private readonly ldt: luxon.DateTime;

    private constructor(ldt: luxon.DateTime) {
        if (!ldt) {
            throw 'MKDate(): empty date passed';
        }
        if (!ldt.isValid) {
            throw `MKDate(): wrong data passed: ${ldt.invalidReason} - ${ldt.invalidExplanation}`;
        }
        this.ldt = ldt;
    }

    static epochMilliseconds(): number {
        return new Date().getTime();
    }

    static fromISO(text: string): MKDate {
        return new MKDate(luxon.DateTime.fromISO(text));
    }
    static fromLocalJSDate(date: Date): MKDate {
        return new MKDate(luxon.DateTime.fromJSDate(date));
    }
    static utcNow(): MKDate {
        return new MKDate(luxon.DateTime.now().toUTC());
    }
    static localNow(): MKDate {
        return new MKDate(luxon.DateTime.now());
    }
    static localNowPlusSeconds(seconds: number): MKDate {
        return new MKDate(luxon.DateTime.now().plus({ seconds: seconds }));
    }

    static utc(year: number, month: number, day: number, hour = 0, minute = 0, second = 0, millisecond = 0): MKDate {
        return new MKDate(luxon.DateTime.utc(year, month, day, hour, minute, second, millisecond));
    }

    static local(
        year: number,
        month: number,
        day: number,
        hour: number,
        minute: number,
        second: number,
        millisecond: number,
    ): MKDate {
        return new MKDate(luxon.DateTime.local(year, month, day, hour, minute, second, millisecond));
    }

    private _preformat(options?: { zone?: MKDate.Zone }): { ld: luxon.DateTime; formatPostfix: string } {
        let ld = this.ldt;

        let formatPostfix: string;
        switch (options?.zone) {
            case undefined:
            case 'local':
                ld = ld.toLocal();
                formatPostfix = '';
                break;
            case 'utc':
                ld = ld.toUTC();
                formatPostfix = ' ZZZZ';
                break;
            case 'original':
                formatPostfix = ' ZZZZ';
                break;
        }
        return { ld, formatPostfix };
    }

    toUtcISODateString(): string {
        return this.ldt.toUTC().toISODate();
    }

    toISOString(): string {
        return this.ldt.toISO();
    }

    toString(options?: { zone?: MKDate.Zone; preset?: MKDate.FormatPreset }): string {
        const { ld, formatPostfix } = this._preformat(options);
        let format: string;

        switch (options?.preset) {
            case undefined:
            case 'timestamp':
                if (ld.year != _currentYear) {
                    format = 'yyyy-MM-dd HH:mm:ss.SSS';
                } else if (ld.year * 10000 + ld.month * 100 + ld.day != _currentYMD) {
                    format = 'MM-dd HH:mm:ss.SSS';
                } else {
                    format = 'HH:mm:ss.SSS';
                }
                break;

            case 'timestamp2':
                format = 'yyyyMMdd-HHmmss-SSS';
                break;

            case 'date':
                format = 'yyyy-MM-dd';
                break;

            case 'time':
                format = 'HH:mm:ss';
                break;

            case 'time2':
                format = 'HH:mm:ss.SSS';
                break;
                    
            case 'compact':
                if (ld.year != _currentYear) {
                    format = 'yyyy-MM-dd HH:mm:ss';
                } else if (ld.year * 10000 + ld.month * 100 + ld.day != _currentYMD) {
                    format = 'MM-dd HH:mm:ss';
                } else {
                    format = 'HH:mm:ss';
                }
                break;
        }
        return ld.toFormat(format + formatPostfix);
    }

    toJSON(): string {
        return this.ldt.toJSON();
    }

    /** This is for console.log */
    [util.inspect.custom](_depth: any, options: any): string {
        return options.stylize(`MKDate(${this})`, 'date');
    }

    addedMonths(months: number): MKDate {
        if (this.day > 28) {
            throw 'The function does not work properly for edge dates yet. Implement it!';
        }
        return new MKDate(this.ldt.plus({ months: months }));
    }

    addedSeconds(seconds: number): MKDate {
        return new MKDate(this.ldt.plus({ seconds: seconds }));
    }

    addedDays(days: number): MKDate {
        return new MKDate(this.ldt.plus({ days: days }));
    }

    addedMilliseconds(ms: number): MKDate {
        return new MKDate(this.ldt.plus({ milliseconds: ms }));
    }

    get yearMonth(): number {
        return this.ldt.year * 100 + this.ldt.month;
    }
    get year(): number {
        return this.ldt.year;
    }
    get month(): number {
        return this.ldt.month;
    }
    get day(): number {
        return this.ldt.day;
    }
    get weekday(): number {
        return this.ldt.weekday;
    } // 1 is Monday and 7 is Sunday

    valueOf(): number {
        return this.ldt.valueOf();
    }

    static areEqual(d1: MKDate | null | undefined, d2: MKDate | null | undefined): boolean {
        if (d1) {
            return d1.isEqual(d2);
        }
        return !d2;
    }

    /**
     * Basic comparing. Let null/undefined goes last (just by design. do not change this).
     * Use this for all other comparing just to be consistent
     * @returns 0, 1, -1
     */
    static compare(d1: MKDate | null | undefined, d2: MKDate | null | undefined): number {
        if (d1) {
            if (d2) {
                const delta = d1.ldt.valueOf() - d2.ldt.valueOf();
                return delta == 0 ? 0 : delta < 0 ? -1 : 1;
            }
            return -1;
        }
        return d2 ? 1 : 0;
    }

    static max(d1: MKDate | null | undefined, d2: MKDate | null | undefined): MKDate | null | undefined {
        return MKDate.compare(d1, d2) < 0 ? d2 : d1;
    }

    static min(d1: MKDate | null | undefined, d2: MKDate | null | undefined): MKDate | null | undefined {
        return MKDate.compare(d1, d2) < 0 ? d1 : d2;
    }

    /** Compare only by ValueOf() - this is the absolute time, no timezones. I.e. localNow() == utcNow() */
    isEqual(other: MKDate | null | undefined): boolean {
        if (other) {
            return this.valueOf() == other.valueOf();
        }
        return false;
    }

    isBefore(other: MKDate | null | undefined): boolean {
        return MKDate.compare(this, other) < 0;
    }

    isBeforeOrEqual(other: MKDate | null | undefined): boolean {
        return MKDate.compare(this, other) <= 0;
    }

    isAfter(other: MKDate | null | undefined): boolean {
        return MKDate.compare(this, other) > 0;
    }

    isAfterOrEqual(other: MKDate | null | undefined): boolean {
        return MKDate.compare(this, other) >= 0;
    }

    durationSince(other: MKDate): MKDuration {
        return new MKDuration(this.valueOf() - other.valueOf());
    }

    /// For past events
    durationToNow(): MKDuration {
        return new MKDuration(luxon.DateTime.now().valueOf() - this.valueOf());
    }
}

export namespace MKDate {
    export type Zone = 'local' | 'utc' | 'original';
    export type FormatPreset = 'timestamp' | 'compact' | 'timestamp2' | 'date' | 'time' | 'time2';
}
