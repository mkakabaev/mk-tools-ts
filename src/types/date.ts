// import { inspect } from 'util';
import { MKDuration } from './duration';
import { MKSimpleDate } from './simple_date';

// ------------------------------------------------------------------------------------------------

export class MKDate {
    private readonly _dt: Date;

    private constructor(dt: Date) {
        if (!dt) {
            throw 'MKDate(): empty date passed';
        }
        this._dt = dt;
    }

    static epochMilliseconds(): number {
        return new Date().getTime();
    }

    static fromSimple(s: MKSimpleDate): MKDate {
        return new MKDate(new Date(s));
    }

    /*
    static fromISO(text: string): MKDate {
        return new MKDate(LDateTime.fromISO(text));
    }
    static fromLocalJSDate(date: Date): MKDate {
        return new MKDate(LDateTime.fromJSDate(date));
    }
    static utcNow(): MKDate {
        return new MKDate(LDateTime.now().toUTC());
    }
    */
    static now(): MKDate {
        return new MKDate(new Date());
    }

    static fromSystemDate(d: Date): MKDate {
        return new MKDate(d);
    }

    /**
     * By default, the date is in the UTC time zone. To create a date in the local time zone, 
     * use `options.isLocal = true`.
     *
     * @param {number} year - The year for the date.
     * @param {number} month - The month for the date. (1-indexed)
     * @param {number} day - The day of the month for the date.
     * @returns {MKDate} -
     */
    static ymd(year: number, month: number, day: number, options?: { isLocal?: boolean, skipValidation?: boolean }): MKDate {
        if (!options?.skipValidation) {
            MKDate.validateComponents(year, month, day, 0, 0, 0, 0);
        }
        if (options?.isLocal) {
            return new MKDate(new Date(year, month - 1, day));
        }
        return new MKDate(new Date(Date.UTC(year, month - 1, day)));
    }

    /**
        @param {number} year - The year for the date.
        @param {number} month - The month for the date. (1-indexed)
        @param {number} day - The day of the month for the date.
        @returns {MKDate} -
    */
    static fromComponents(
        year: number,
        month: number,
        day: number,
        hour: number,
        minutes: number,
        seconds: number,
        milliseconds: number,
        options?: { isLocal?: boolean, skipValidation?: boolean }
    ): MKDate {
        if (!options?.skipValidation) {
            MKDate.validateComponents(year, month, day, hour, minutes, seconds, milliseconds);
        }
        if (options?.isLocal) {
            return new MKDate(new Date(year, month - 1, day, hour, minutes, seconds, milliseconds));
        }
        return new MKDate(new Date(Date.UTC(year, month - 1, day, hour, minutes, seconds, milliseconds)));
    }

    static validateComponents(year: number,
        month: number,
        day: number,
        hour: number,
        minutes: number,
        seconds: number,
        milliseconds: number,
    ) {
        if (year < 1000 || year > 3000) {
            throw Error(`Invalid year: ${year}`);
        }
        if (month < 1 || month > 12) {
            throw Error(`Invalid month: ${month}`);
        }
        
        const monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
        let dayInMonth = monthLength[month - 1];
        if (month === 2) {
            if ((year % 100 != 0 && year % 4 == 0) || year % 400 == 0) {
                dayInMonth = 29;
            }
        }
        if (day < 1 || day > dayInMonth) {
            throw Error(`Invalid day: ${day}`);
        }

        if (hour < 0 || hour > 23) {
            throw Error(`Invalid hour: ${hour}`);
        }
        if (minutes < 0 || minutes > 60) {
            throw Error(`Invalid minutes: ${minutes}`);
        }
        if (seconds < 0 || seconds > 60) {
            throw Error(`Invalid seconds: ${seconds}`);
        }
        if (milliseconds < 0 || milliseconds > 1000) {
            throw Error(`Invalid milliseconds: ${milliseconds}`);
    
        }
    }


    /*
    static localNowPlusSeconds(seconds: number): MKDate {
        return new MKDate(LDateTime.now().plus({ seconds: seconds }));
    }

    static utc(year: number, month: number, day: number, hour = 0, minute = 0, second = 0, millisecond = 0): MKDate {
        return new MKDate(LDateTime.utc(year, month, day, hour, minute, second, millisecond));
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
        return new MKDate(LDateTime.local(year, month, day, hour, minute, second, millisecond));
    }

    private _preformat(options?: { zone?: MKDate.Zone }): { ld: LDateTime; formatPostfix: string } {
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
    */

    /**
     * @returns YYYY-MM-DD string
     */
    toISODateString(): string {
        return this._dt.toISOString().slice(0, 10);
    }

    toISOString(): string {
        return this._dt.toISOString();
    }

    /**
     *  2023-05-22 20:14:44.934' Simplest format
    */
    toString(): string {        
        const asLocal = new Date(this._dt.getTime() - this._dt.getTimezoneOffset() * 60000);
        return `${asLocal.toISOString().slice(0, 19).replace('T', ' ')}.${asLocal.getMilliseconds().toString().padStart(3, '0')}`;
    }

    /*
    toString(options?: { zone?: MKDate.Zone; preset?: MKDate.FormatPreset }): string {
        const { ld, formatPostfix } = this._preformat(options);
        let format: string;

        switch (options?.preset) {
            case undefined:
            case 'timestamp':
                format = 'yyyy-MM-dd HH:mm:ss.SSS';
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
        }
        return ld.toFormat(format + formatPostfix);
    }
    */

    toJSON(): MKSimpleDate {
        return this._dt.getTime() as MKSimpleDate;
    }

    /** This is for console.log */
    // [inspect.custom](_depth: any, options: any): string {
    //    return options.stylize(`MKDate(${this})`, 'date');
    // }

    addedMonths(months: number): MKDate {
        const dt = new Date(this._dt);
        dt.setMonth(dt.getMonth() + months);
        return new MKDate(dt);
    }

    addedSeconds(seconds: number): MKDate {
        const dt = new Date(this._dt);
        dt.setSeconds(dt.getSeconds() + seconds);
        return new MKDate(dt);
    }

    addedDays(days: number): MKDate {
        const dt = new Date(this._dt);
        dt.setDate(dt.getDay() + days);
        return new MKDate(dt);
    }

    addedMilliseconds(ms: number): MKDate {
        const dt = new Date(this._dt);
        dt.setMilliseconds(dt.getMilliseconds() + ms);
        return new MKDate(dt);
    }

    /*
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
    */

    valueOf(): number {
        return this._dt.valueOf();
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
                const delta = d1._dt.valueOf() - d2._dt.valueOf();
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

    isEqual(other: MKDate | null | undefined): boolean {
        if (other) {
            return this.valueOf() === other.valueOf();
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
    /** Duration between the date and the current time. Positive for past dates */
    durationToNow(): MKDuration {
        return new MKDuration(Date.now() - this.valueOf());
    }
}

export namespace MKDate {
    // export type Zone = 'local' | 'utc' | 'original';
    // export type FormatPreset = 'timestamp' | 'compact' | 'timestamp2' | 'date' | 'time' | 'time2';
}
