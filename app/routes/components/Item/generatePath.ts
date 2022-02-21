export function generatePath(itemId: number, parentPath?: string) {
  if (!parentPath || parentPath.length === 0) {
    return String(itemId);
  }
  return [parentPath, itemId].join(".");
}
