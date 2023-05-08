/**  Similar to Partial but to make assigning all the stuff explicitly */
export type SetUndefinable<T> = {
    [P in keyof Required<T>]-?: T[P] | undefined;
};

export type SetUndefinableNullable<T> = {
    [P in keyof Required<T>]-?: T[P] | undefined | null;
};

export type PatchOptions<T, EU extends keyof T, NUL extends keyof T = never> = Pick<SetUndefinable<T>, EU> &
    Pick<SetUndefinableNullable<T>, NUL>;

export type CreateOptions<T, REQ extends keyof T, EU extends keyof T = never> = Pick<T, REQ> &
    Pick<SetUndefinable<T>, EU>;

export function extractFromObj<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    return keys.reduce((newObj, curr) => {
        newObj[curr] = obj[curr];
        return newObj;
    }, {} as Pick<T, K>);
}
