declare const dateIdSymbol: unique symbol;
export type MKSimpleDate = number & { [dateIdSymbol]: never };
export type OptionalMKSimpleDate = MKSimpleDate | undefined;
