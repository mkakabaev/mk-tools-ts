import { MKDate } from '../src';

test('Date base tests', () => {
    const date1 = MKDate.utc(2021, 3, 1);
    const date2 = date1.addedMonths(1);
    // const date3 = MKDate.local(2021, 3, 1, 23, 11, 59);
    expect(date1.toUtcISODateString()).toBe('2021-03-01');
    expect(date2.toUtcISODateString()).toBe('2021-04-01');
    expect(() => MKDate.utc(2021, 3, 0)).toThrow();
    expect(date1.toISOString()).toBe('2021-03-01T00:00:00.000Z');
});

test('Date incrementing', () => {
    expect(MKDate.utc(2021, 3, 1).addedMonths(1)).toEqual(MKDate.utc(2021, 4, 1));
    // expect(MKDate.utc(2021, 12, 31).addedMonths(1)).toEqual(MKDate.utc(2022, 1, 31));
    // expect(MKDate.utc(2021, 12, 31).addedMonths(12)).toEqual(MKDate.utc(2022, 12, 31));
    expect(MKDate.utc(2021, 12, 28).addedMonths(2)).toEqual(MKDate.utc(2022, 2, 28));
    expect(MKDate.utc(2020, 1, 28).addedMonths(2)).toEqual(MKDate.utc(2020, 3, 28));
});

test('Date comparisons', () => {
    const d1 = MKDate.utc(2021, 3, 1);

    expect(MKDate.compare(d1, d1)).toBe(0);
    expect(MKDate.compare(d1, null)).toBe(-1);
    expect(MKDate.compare(d1, undefined)).toBe(-1);
    expect(MKDate.compare(null, d1)).toBe(1);
    expect(MKDate.compare(undefined, d1)).toBe(1);
    expect(MKDate.compare(null, null)).toBe(0);
    expect(MKDate.compare(null, undefined)).toBe(0);
    expect(MKDate.compare(undefined, null)).toBe(0);
    expect(MKDate.compare(undefined, undefined)).toBe(0);

    const d2 = MKDate.utc(2021, 3, 1, 0, 0, 1);

    expect(MKDate.compare(d1, d2)).toBe(-1);
    expect(MKDate.compare(d2, d1)).toBe(1);
    expect(d1.isBefore(d2)).toBe(true);
    expect(d1.isBeforeOrEqual(d2)).toBe(true);
    expect(d2.isBefore(d1)).toBe(false);
    expect(d2.isBeforeOrEqual(d1)).toBe(false);
    expect(d1.isBefore(null)).toBe(true);
    expect(d1.isBeforeOrEqual(undefined)).toBe(true);

    expect(d1.isAfter(d2)).toBe(false);
    expect(d1.isAfterOrEqual(d2)).toBe(false);
    expect(d2.isAfter(d1)).toBe(true);
    expect(d2.isAfterOrEqual(d1)).toBe(true);
    expect(d1.isAfter(null)).toBe(false);
    expect(d1.isAfterOrEqual(undefined)).toBe(false);

    expect(MKDate.max(d1, d2)).toEqual(d2);
    expect(MKDate.min(d1, d2)).toEqual(d1);
    expect(d1.isEqual(d2)).toBe(false);
    expect(d1.isEqual(d1)).toBe(true);
    expect(d1.isEqual(undefined)).toBe(false);
    expect(d1.isEqual(null)).toBe(false);

    expect(MKDate.min(d1, null)).toEqual(d1);
    expect(MKDate.max(d1, null)).toEqual(null);
    expect(MKDate.min(null, d1)).toEqual(d1);
    expect(MKDate.max(null, d1)).toEqual(null);
});
