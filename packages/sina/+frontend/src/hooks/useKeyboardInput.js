export function useKeyboardInput(key, fn) {
  const originalKeyInput = key;
  key = key.toLowerCase();

  if (globalKeyRegister.has(key)) {
    console.error(
      `The key ${originalKeyInput} has been registered by: ${keyAndFnRegister.get(key)}`,
    );
    return;
  }

  const parts = key.split("+");
  const mainKey = parts.pop();
  const parsed = {
    key: mainKey,
    ctrl: parts.includes("ctrl"),
    shift: parts.includes("shift"),
    alt: parts.includes("alt"),
    meta: parts.includes("meta") || parts.includes("cmd"),
  };

  const componentName = fn.name || "An anonymous function";

  globalKeyRegister.add(key);
  keyAndFnRegister.set(key, componentName);

  const listener = (event) => {
    const keyMatches = event.key.toLowerCase() === parsed.key;
    const modifiersMatch =
      event.ctrlKey === parsed.ctrl &&
      event.shiftKey === parsed.shift &&
      event.altKey === parsed.alt &&
      event.metaKey === parsed.meta;

    if (keyMatches && modifiersMatch) {
      event.preventDefault();
      fn(event);
    }
  };

  window.addEventListener("keydown", listener);

  return () => {
    window.removeEventListener("keydown", listener);
    globalKeyRegister.delete(key);
    keyAndFnRegister.delete(key);
  };
}
