export function get<T extends Record<string, T>>(
  data: Record<string, T>,
  path: string,
): Record<string, T> | T | undefined {
  if (!data || !path) {
    return undefined;
  }
  const pathArray: string[] = path.replace(/\[([0-9]+)\]/g, '.$1').split('.');
  const arrayRegex = /^\[?([0-9]+)\]?$/;
  let result = data;
  for (let key of pathArray) {
    key = key.replace(arrayRegex, '$1');
    result = result[key];
    if (!result) {
      break;
    }
  }
  return result;
}
