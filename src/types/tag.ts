export type TagValue = string | number;
export type OptionalTagValue = TagValue | undefined;

export type TagLike = TagValue | Tag;
export type OptionalTagLike = TagLike | undefined;

export type OptionalTag = Tag | undefined;
export class Tag {
    //
    private readonly _parent: Tag | undefined;
    readonly value: TagValue;

    constructor(value: TagValue, parent?: Tag) {
        this.value = value;
        this._parent = parent;
    }

    static resolve(tag: OptionalTagLike, tagNext?: OptionalTagValue): OptionalTag {
        if (tag == null) {
            return tagNext == null ? undefined : new Tag(tagNext);
        }
        const result = tag instanceof Tag ? tag : new Tag(tag);
        return tagNext == null ? result : result.next(tagNext);
    }

    static make(value: TagValue, parent?: OptionalTagLike): Tag {
        return new Tag(value, Tag.resolve(parent));
    }

    next(object: TagValue): Tag {
        return new Tag(object, this);
    }

    toString(): string {
        const result: string[] = [];
        let s: Tag = this; // eslint-disable-line  @typescript-eslint/no-this-alias
        while (s._parent) {
            if (typeof s.value === 'number') {
                result.unshift(`[${s.value}]`); // mimic array indices
            } else {
                result.unshift(`/${s.value}`);
            }
            s = s._parent;
        }
        result.unshift(`${s.value}`);
        return result.join('');
    }
}
