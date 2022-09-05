async function check(Component) {
  return Component[Object?.keys(Component)[0]]?.init;
}

async function renderToStaticMarkup(Component, props, _, metadata) {
  const vNode = Component[Object?.keys(Component)[0]]?.vNode;
  return { html: renderToString(vNode({ props, metadata })) };
}

function renderToString(vNode) {
  const tag = vNode.$;

  if (tag === 0) {
    return vNode.a;
  }

  if (tag === 1) {
    if (vNode.c) {
      const attributes = Object.keys(vNode.d)
        .map((key) => {
          switch (key) {
            case "className":
              return ` class="${vNode.d[key]}"`;

            case "a0":
              return "";

            case "a1":
              const styles = Object.keys(vNode.d[key]);
              return ` style="${styles
                .map((style) => `${style}:${vNode.d[key][style]};`)
                .join("")}"`;

            case "a3":
              const a3Key = Object.keys(vNode.d[key])[0];
              return ` ${a3Key}="${vNode.d[key][a3Key]}"`;

            default:
              return ` ${key}="${vNode.d[key]}"`;
          }
        })
        .join("");

      const children = vNode.e.map((child) => renderToString(child)).join("");

      return `<${vNode.c}${attributes}>${children}</${vNode.c}>`;
    }
  }
}

export default {
  check,
  renderToStaticMarkup,
};
