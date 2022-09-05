function isAlreadyHydrated(element) {
  for (const key in element) {
    if (key.startsWith("__reactContainer")) {
      return key;
    }
  }
}

export default (element) =>
  (Component, props, { default: children, ...slotted }, { client }) => {
    if (!element.hasAttribute("ssr")) return;
    console.log(element);
    return startTransition(() => {
      hydrateRoot(element, componentEl);
    });
  };
