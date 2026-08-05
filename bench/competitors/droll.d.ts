// droll ships no types; this covers the two functions the suite calls.
declare module 'droll' {
  export type DrollResult = {
    rolls: number[];
    modifier: number;
    total: number;
  };

  export function roll(notation: string): DrollResult | false;
  export function validate(notation: string): boolean;
}
