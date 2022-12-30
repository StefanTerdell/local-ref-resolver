export const objPath = (obj: any, path: string[]): any =>
  path.length && obj
    ? path[0] in obj && typeof obj[path[0]] === "object"
      ? objPath(obj[path[0]], path.slice(1))
      : obj[path[0]]
    : obj;
