import { requiredFloat, requiredInt, MKError, requiredString, ParseOptions } from '../src';

test('String from int or bigint', () => {
    const ri = (v: any, o?: ParseOptions & { defaultValue?: string }) => requiredString(v, { acceptNumber: true, ...o }); 
    expect(ri('0')).toBe('0');
    expect(ri(0)).toBe('0');
    expect(ri(+1)).toBe('1');
    expect(ri(12345678901234567890n)).toBe('12345678901234567890');
    expect(ri(-12)).toBe('-12');
    expect(ri(1.345)).toBe('1.345');
});

test('requiredInt', () => { 

    const ri = (v: any, o?: any) => requiredInt(v, o);

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

    const rf = (v: any, o?: any) => requiredFloat(v, o);

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

