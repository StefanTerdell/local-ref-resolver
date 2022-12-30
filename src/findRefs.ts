export const findRefs = (
  obj: any,
  refs: [string, string][],
  path: string
): [string, string][] => {
  if (typeof obj === "object" && obj !== null) {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => findRefs(item, refs, `${path}/${index}`));
    } else {
      Object.entries(obj).forEach(([key, value]) => {
        if (key === "$ref" && typeof value === "string") {
          for (const ref of refs) {
            if (ref[1] === path) {
              ref[1] = value;
            }
          }
          refs.push([path, value]);
        } else {
          findRefs(value, refs, `${path}/${key}`);
        }
      });
    }
  }

  return refs;
};
