import { parse } from "acorn";
import { fullAncestor as walk } from "acorn-walk";

const ASSET_TAG = /'\[VITE_PLUGIN_ELM_ASSET:(?<path>.+?)\]'/g;
const HELPER_PACKAGE_IDENTIFIER = "VITE_PLUGIN_HELPER_ASSET";

const importNameFrom = (path) => {
  return path.replace(/[/.\-~@?]/g, "_");
};

const generateImports = (paths) => {
  return paths
    .map((path) => `import ${importNameFrom(path)} from '${path}'`)
    .join("\n");
};

const isLiteral = (node) => node.type === "Literal";

const isDeclarator = (node) => node.type === "VariableDeclarator";

const isCallExpression = (node) => node.type === "CallExpression";

export default (compiledESM) => {
  const taggedPaths = [];

  const ast = parse(compiledESM, { ecmaVersion: 2015, sourceType: "module" });
  let helperFunctionName;
  walk(
    ast,
    (node, state) => {
      if (isLiteral(node)) {
        // Find callers of VitePluginHelper.asset
        if (
          !helperFunctionName &&
          node.raw === `'${HELPER_PACKAGE_IDENTIFIER}'`
        ) {
          const helperFunc = state?.find(
            (nodeOnState) =>
              isDeclarator(nodeOnState) &&
              nodeOnState?.init?.body?.body?.[0]?.argument?.left?.raw ===
                `'${HELPER_PACKAGE_IDENTIFIER}'`
          );
          if (helperFunc?.id?.name) {
            helperFunctionName = helperFunc.id.name;
            walk(
              ast,
              (node) => {
                if (
                  isCallExpression(node) &&
                  node?.callee?.name === helperFunctionName
                ) {
                  if (
                    node?.arguments?.length === 1 &&
                    isLiteral(node.arguments[0])
                  ) {
                    const matchedPath = node.arguments[0].value;
                    taggedPaths.push({
                      path: matchedPath,
                      start: node.start,
                      end: node.end,
                    });
                  } else {
                    throw "Arguments for VitePluginHelper should be just a plain String";
                  }
                }
              },
              undefined,
              null
            );
          }
          return;
        }

        // Find plain asset tags
        const matched = ASSET_TAG.exec(node.raw);
        if (matched !== null) {
          if (matched.groups?.path) {
            taggedPaths.push({
              path: matched.groups.path,
              start: node.start,
              end: node.end,
            });
          }
        }
      }
    },
    undefined,
    null
  );

  if (taggedPaths.length > 0) {
    const src = compiledESM.split("");
    const importPaths = [];
    taggedPaths.forEach(({ path, start, end }) => {
      for (let i = start; i < end; i++) {
        src[i] = "";
      }
      src[start] = importNameFrom(path);
      if (!importPaths.includes(path)) {
        importPaths.push(path);
      }
    });
    return `${generateImports(importPaths)}\n\n${src.join("")}`;
  } else {
    return compiledESM;
  }
};
