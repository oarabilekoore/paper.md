let currentEffect = null;

export function CreateState(defaultValue) {
  if (defaultValue === undefined) {
    console.log(`A state function cannot have any of its 
      parameters nully.`);
  }
  let monitoredVal = defaultValue;
  const subscribers = new Set();

  const read = () => {
    if (currentEffect) {
      subscribers.add(currentEffect);
    }
    return monitoredVal;
  };

  const update = (value) => {
    monitoredVal = value;
    [...subscribers].forEach((fn) => fn());
  };

  return [read, update];
}

export function UseEffect(fn) {
  const executeEffect = () => {
    const prevEffect = currentEffect;
    currentEffect = executeEffect;
    try {
      fn();
    } finally {
      currentEffect = prevEffect;
    }
  };

  executeEffect();
}

export function UseComputed(fn) {
  const [read, write] = useState(fn());
  useEffect(() => {
    write(fn());
  });
  return read;
}

const globalKeyRegister = new Set();
const keyAndFnRegister = new Map();

export function CreateInputListener(key, fn) {
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
