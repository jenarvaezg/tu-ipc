export declare const V2_SPLIT_12_WEIGHTS: Readonly<{ 12: number; 13: number }>

export declare function foldV2GroupCodeToV1(twoDigitCode: string): string

export declare function combineV2SplitCategory12(
  newData: Record<string, Record<string, Record<string, number>>>,
): void
