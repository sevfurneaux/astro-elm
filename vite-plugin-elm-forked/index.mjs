import { toESModule } from "elm-esm";
import compiler from "node-elm-compiler";
import { normalize, relative } from "path";
import injectAssets from "./assetsInjector.mjs";
import injectHMR from "./injectHMR.mjs";
import acquireLock from "./mutex.mjs";

const trimDebugMessage = (code) =>
  code.replace(/(console\.warn\('Compiled in DEBUG mode)/, "// $1");
const viteProjectPath = (dependency) =>
  `/${relative(process.cwd(), dependency)}`;

const parseImportId = (id) => {
  const parsedId = new URL(id, "file://");
  const pathname = parsedId.pathname;
  const valid = pathname.endsWith(".elm");
  const withParams = parsedId.searchParams.getAll("with");

  return {
    valid,
    pathname,
    withParams,
  };
};

export const plugin = (opts) => {
  const compilableFiles = new Map();
  const debug = opts?.debug;
  const optimize = opts?.optimize;

  return {
    name: "vite-plugin-elm",
    enforce: "pre",
    handleHotUpdate({ file, server, modules }) {
      const { valid } = parseImportId(file);
      if (!valid) return;

      const modulesToCompile = [];
      compilableFiles.forEach((dependencies, compilableFile) => {
        if (dependencies.has(normalize(file))) {
          const module = server.moduleGraph.getModuleById(compilableFile);
          if (module) modulesToCompile.push(module);
        }
      });

      if (modulesToCompile.length > 0) {
        server.ws.send({
          type: "custom",
          event: "hot-update-dependents",
          data: modulesToCompile.map(({ url }) => url),
        });
        return modulesToCompile;
      } else {
        return modules;
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.endsWith('.elm')) {
          req.url += '?import'
          res.setHeader('Content-Type', 'application/javascript')
        }
    
        next()
      })
    },
    async load(id) {
      const { valid, pathname, withParams } = parseImportId(id);
      if (!valid) return;

      const accompanies = await (() => {
        if (withParams.length > 0) {
          const importTree = this.getModuleIds();
          let importer = "";
          for (const moduleId of importTree) {
            if (moduleId === id) break;
            importer = moduleId;
          }
          const resolveAcoompany = async (accompany) =>
            (await this.resolve(accompany, importer))?.id ?? "";
          return Promise.all(withParams.map(resolveAcoompany));
        } else {
          return Promise.resolve([]);
        }
      })();

      const targets = [pathname, ...accompanies].filter(
        (target) => target !== ""
      );

      compilableFiles.delete(id);
      const dependencies = (
        await Promise.all(
          targets.map((target) => compiler.findAllDependencies(target))
        )
      ).flat();
      compilableFiles.set(id, new Set([...accompanies, ...dependencies]));

      const releaseLock = await acquireLock();
      try {
        const isBuild = process.env.NODE_ENV === "production";
        let compiled = await compiler.compileToString(targets, {
          output: ".js",
          optimize:
            typeof optimize === "boolean" ? optimize : !debug && isBuild,
          verbose: isBuild,
          debug: debug ?? !isBuild,
        });
        compiled = compiled.replace(
          "'init':",
          `'vNode': (args) => {
              var result = A2(
              _Json_run,
              $elm$json$Json$Decode$value,
              _Json_wrap(args)
              );
              var initPair = $author$project$Main$init(result.a);
              var model = initPair.a;
              return $author$project$Main$view(model);
          }, 'init':
          `
        );

        const esm = injectAssets(toESModule(compiled));

        // Apparently `addWatchFile` may not exist: https://github.com/hmsk/vite-plugin-elm/pull/36
        if (this.addWatchFile) {
          dependencies.forEach(this.addWatchFile.bind(this));
        }

        return {
          code: isBuild
            ? esm
            : trimDebugMessage(
                injectHMR(esm, dependencies.map(viteProjectPath))
              ),
          map: null,
        };
      } catch (e) {
        if (e instanceof Error && e.message.includes("-- NO MAIN")) {
          const message = `${viteProjectPath(
            pathname
          )}: NO MAIN .elm file is requested to transform by vite. Probably, this file is just a depending module`;
          throw message;
        } else {
          throw e;
        }
      } finally {
        releaseLock();
      }
    },
  };
};

export default plugin;
