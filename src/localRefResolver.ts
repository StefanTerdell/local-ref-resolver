export const objPath = (obj: any, path: string[]): any =>
  path.length && obj
    ? path[0] in obj && typeof obj[path[0]] === "object"
      ? objPath(obj[path[0]], path.slice(1))
      : obj[path[0]]
    : obj;

export const findRefs = (
  obj: any,
  refs: [string, string][],
  path: string
): [string, string][] => {
  for (const [key, value] of Object.entries<any>(obj).filter(
    ([, value]) => typeof value === "object" && value != null
  )) {
    const keyPath = `${path}/${key}`;
    if (value.$ref) {
      refs.push([keyPath, value.$ref]);
      for (const ref of refs) {
        if (ref[1] === keyPath) {
          ref[1] = value.$ref;
        }
      }
    } else {
      findRefs(value, refs, keyPath);
    }
  }
  return refs;
};

export const resolveRefs = (
  obj: any,
  refs: [string, string][],
  options: Options = {
    unresolvable: "warn",
    merge: false,
    keepRefs: false,
  }
): any => {
  for (const [targetRef, sourceRef] of refs) {
    const sourcePath = sourceRef.split("/").slice(1);
    const source = objPath(obj, sourcePath);
    if (source) {
      const targetKey = targetRef.slice(targetRef.lastIndexOf("/") + 1);
      const targetPath = targetRef.split("/").slice(1, -1);
      const target = objPath(obj, targetPath);
      const bothAreObjects =
        typeof target[targetKey] === "object" && typeof source === "object";
      if (options.merge && bothAreObjects) {
        const targetEntries = Object.entries(target[targetKey]);
        const sourceEntries = Object.entries(source ?? {});
        const $refIndex = targetEntries.findIndex(([key]) => key === "$ref");
        const entries =
          options.merge === "favorTarget"
            ? [...sourceEntries, ...targetEntries]
            : options.merge === "favorSource"
            ? [...targetEntries, ...sourceEntries]
            : [
                ...targetEntries.slice(0, $refIndex),
                ...sourceEntries,
                ...targetEntries.slice($refIndex),
              ];

        target[targetKey] = entries.reduce(
          (acc, [key, value]) =>
            key !== "$ref" || options.keepRefs
              ? {
                  ...acc,
                  [key === "$ref" && typeof options.keepRefs === "string"
                    ? options.keepRefs
                    : key]: value,
                }
              : acc,
          {}
        );
      } else if (options.keepRefs && bothAreObjects) {
        target[targetKey] = {
          ...(source ?? {}),
          [typeof options.keepRefs === "string" ? options.keepRefs : "$ref"]:
            target[targetKey]["$ref"],
        };
      } else {
        target[targetKey] = source;
      }
    } else if (options.unresolvable === "warn") {
      console.warn(`Could not resolve $ref from ${targetRef} to ${sourceRef}`);
    } else if (options.unresolvable === "throw") {
      throw `localRefResolver could not resolve $ref from ${targetRef} to ${sourceRef}`;
    }
  }
  return obj;
};

export type Options = {
  merge?: boolean | "favorTarget" | "favorSource";
  keepRefs?: boolean | string;
  unresolvable?: "skip" | "warn" | "throw";
  refFilter?: (ref: [string, string]) => boolean;
};

export const localRefResolver = (root: any, options?: Options): any =>
  root
    ? resolveRefs(
        root,
        findRefs(root, [], "#").filter(
          options?.refFilter ??
            (([, source]) => typeof source === "string")
        ),
        options
      )
    : root;
