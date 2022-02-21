export function pathToItemId(path?: string) {
  return Number(path?.split(".").pop());
}
