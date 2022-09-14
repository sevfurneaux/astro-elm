export default (element) =>
  (Component, props, { default: children, ...slotted }, { client }) => {
    Component[Object?.keys(Component)[0]].init({
      flags: { props },
      node: element,
    });
  };
