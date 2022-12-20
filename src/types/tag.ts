export type TagValue = string | number;

export type TagLike = TagValue | Tag;

export class Tag {
    //
    private readonly _parent: Tag | undefined;
    readonly value: TagValue;

    constructor(value: TagValue, parent?: Tag) {
        this.value = value;
        this._parent = parent;
    }

    static resolve(t: TagLike | undefined): Tag | undefined {
        if (t !== undefined) {
            if (t instanceof Tag) {
                return t;
            }
            return new Tag(t);
        }
    }

    static make(value: TagValue, parent?: TagLike): Tag {
        return new Tag(value, Tag.resolve(parent));
    }

    next(object: TagValue): Tag {
        return new Tag(object, this);
    }

    toString(): string {
        let result = '';
        let s: Tag = this; // eslint-disable-line  @typescript-eslint/no-this-alias
        while (s._parent != null) {
            if (typeof s.value === 'number') {
                // mimic array indices
                result = `[${s.value}]` + result;
            } else {
                result = `.${s.value}` + result;
            }
            s = s._parent;
        }
        result = `${s.value}` + result;
        return result;
    }
}
