export function stringify(v: unknown): string {
    switch (typeof v) {
      case 'undefined':
        return '<undefined>';
      case 'object':
        if (v === null) {
          return '<null>';
        }
        if (v instanceof Date) {
          return v.toISOString();
        }
        if (Array.isArray(v)) {
          return `[${v.map((item) => stringify(item)).join(', ')}]`;
        }
        return JSON.stringify(v);
      case 'string':
        return `'${v}'`;
      case 'boolean':
        return `<${v}>`;
      default:
        return String(v);
    }
  }
  