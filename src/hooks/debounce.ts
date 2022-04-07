export default function <T>(fn: (...args: T[]) => T | void, delay = 300): (...args: T[]) => void {
  let delayTimer: ReturnType<typeof setTimeout>;
  return (...args: T[]) => {
    clearTimeout(delayTimer);
    delayTimer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
