import { MKDate } from './date';
import { MKSimpleDate } from './simple_date';

// ------------------------------------------------------------------------------------------------

export enum ToStringBuilderValueFormat {
    any,
    timestamp,
    raw,
}

// ------------------------------------------------------------------------------------------------

export interface CustomizedToStringBuilder {
    toStringWithBuilder: () => string;
}

// ------------------------------------------------------------------------------------------------

export class ToStringBuilder {
    private entries: string[] = [];
    typename: string | undefined;

    constructor(typename?: string) {
        this.typename = typename;
    }

    addDict(dict: Record<string, any>, formatType = ToStringBuilderValueFormat.any): ToStringBuilder {
        Object.entries(dict).forEach(([key, value]) => this.add(key, value, formatType));
        return this;
    }

    add(name: string, value: any, formatType = ToStringBuilderValueFormat.any): ToStringBuilder {
        if (name != null && value != null) {
            this.entries.push(`${name}: ${this._formatValue(value, formatType)}`);
        }
        return this;
    }

    addBool(name: string, value?: boolean): ToStringBuilder {
        if (name != null && value) {
            this.addRawValue(name);
        }
        return this;
    }

    addRaw(name: string, value: any): ToStringBuilder {
        return this.add(name, value, ToStringBuilderValueFormat.raw);
    }

    addValue(value: any, formatType = ToStringBuilderValueFormat.any): ToStringBuilder {
        if (value != null) {
            this.entries.push(this._formatValue(value, formatType));
        }
        return this;
    }

    addRawValue(value: any): ToStringBuilder {
        return this.addValue(value, ToStringBuilderValueFormat.raw);
    }

    addTag(tag: string): ToStringBuilder {
        return this.addValue(tag, ToStringBuilderValueFormat.raw);
    }

    addTimestampValue(value: any): ToStringBuilder {
        return this.addValue(value, ToStringBuilderValueFormat.timestamp);
    }

    private _formatValue(value: any, formatType: ToStringBuilderValueFormat): string {
        if (value instanceof Object && 'toStringWithBuilder' in value) {
            return (value as CustomizedToStringBuilder).toStringWithBuilder();
        }

        if (Array.isArray(value)) {
            return '[' + value.map((v) => this._formatValue(v, formatType)) + ']';
        }

        switch (formatType) {
            case ToStringBuilderValueFormat.timestamp:
                // trying to interpret number as a Unix milliseconds time
                if ('number' == typeof value) {
                    value = MKDate.fromSimple(value as MKSimpleDate);
                }

                // regular date
                if (value instanceof MKDate) {
                    return value.toString();
                }
                break;

            case ToStringBuilderValueFormat.any:
                break;

            case ToStringBuilderValueFormat.raw:
                return `${value}`;
        }

        // common data processing

        if (value instanceof Date) {
            return value.toLocaleDateString('en-US');
        }

        if ('string' == typeof value) {
            return "'" + value + "'";
        }

        return `${value}`;
    }

    toString(): string {
        const tn = this.typename;
        const e = this.entries.join(', ');
        if (tn) {
            return e ? `<${tn} ${e}>` : `<${tn}>`;
        } else {
            return e;
        }
    }
}
