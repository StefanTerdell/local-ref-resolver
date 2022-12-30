import { findRefs } from "./findRefs";
import { resolveRefs } from "./resolveRefs";
import { Options } from "./options";

export const localRefResolver = (root: any, options?: Options): any =>
  root
    ? resolveRefs(
        root,
        findRefs(root, [], "#").filter(
          options?.refFilter ?? (([, source]) => typeof source === "string")
        ),
        options
      )
    : root;
