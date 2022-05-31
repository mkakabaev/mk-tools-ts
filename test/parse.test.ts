import { parseUtils, MKError } from '../src';

test('requiredInt', () => { 

    const ri = parseUtils.requiredInt;

    expect(ri(0)).toBe(0);
    expect(ri(+0)).toBe(0);
    expect(ri(-0)).toBe(-0);

    expect(ri('0')).toBe(0);
    expect(ri('+0')).toBe(0);
    expect(ri('-0')).toBe(-0);
    expect(ri('1')).toBe(1);
    expect(ri('-00001')).toBe(-1);       
    expect(ri('999999999999999')).toBe(999999999999999);       

    expect(ri(null, { defaultValue: 5 })).toBe(5);
    expect(ri(undefined, { defaultValue: 5 })).toBe(5);
    expect(ri(1, { minValue: 1 })).toBe(1);
    expect(() => ri(0, { minValue: 1 })).toThrow(MKError); 
    expect(ri(100, { maxValue: 1000 })).toBe(100);
    expect(() => ri(0, { maxValue: -6 })).toThrow(MKError); 

    for (const s of [
        '', '+43+', '+-234', "1.1231","   0",
        1.2, +0.00000000002,
        null, undefined,
        {}, []        
    ]) {
        expect(() => ri(s)).toThrow(MKError);
    }
});

test('requiredFloat', () => { 

    const rf = parseUtils.requiredFloat;

    expect(rf(0)).toBe(0);
    expect(rf(+0)).toBe(0);
    expect(rf(-0)).toBe(-0);

    expect(rf('0')).toBe(0);
    expect(rf('+0')).toBe(0);
    expect(rf('-0')).toBe(-0);
    expect(rf('1')).toBe(1);
    expect(rf('-00001')).toBe(-1);       
    expect(rf('999999999999999')).toBe(999999999999999);       
    expect(rf('1.2345')).toBe(1.2345);
    expect(rf('-771.34')).toBe(-771.34);

    expect(rf(null, { defaultValue: 5 })).toBe(5);
    expect(rf(undefined, { defaultValue: 5 })).toBe(5);
    expect(rf(1, { minValue: 1 })).toBe(1);
    expect(() => rf(0, { minValue: 1 })).toThrow(MKError); 
    expect(rf(100, { maxValue: 1000 })).toBe(100);
    expect(() => rf(0, { maxValue: -6 })).toThrow(MKError); 

    expect(rf(1.2)).toBe(1.2);
    expect(rf(+0.00000000002)).toBe(+0.00000000002);


    for (const s of [
        '', '+43+', '+-234', "   0",
        null, undefined,
        {}, []        
    ]) {
        expect(() => rf(s)).toThrow(MKError);
    }
});

