export type Options = {
  merge?: boolean | "favorTarget" | "favorSource";
  keepRefs?: boolean | string;
  unresolvable?: "skip" | "warn" | "throw";
  resolved?: {
    [key: string]: any;
  };
  refFilter?: (ref: [string, string]) => boolean;
};
