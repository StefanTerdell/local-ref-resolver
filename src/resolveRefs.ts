import { objPath } from "./objPath";
import { Options } from "./options";

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
    const source =
      options.resolved?.[sourceRef] !== undefined
        ? options.resolved[sourceRef]
        : objPath(obj, sourceRef.split("/").slice(1));
    if (source !== undefined) {
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
      } else if (true || targetPath.length) {
        target[targetKey] = source;
      } else {
        obj = source;
      }
    } else if (options.unresolvable === "warn") {
      console.warn(`Could not resolve $ref from ${targetRef} to ${sourceRef}`);
    } else if (options.unresolvable === "throw") {
      throw `localRefResolver could not resolve $ref from ${targetRef} to ${sourceRef}`;
    }
  }
  return obj;
};
