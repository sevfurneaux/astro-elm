import { defineConfig } from "astro/config";
import elmPlugin from "./vite-plugin-elm-forked/index.mjs";

const elm = {
  name: "@astrojs/elm",
  hooks: {
    "astro:config:setup": ({ addRenderer, updateConfig }) => {
      addRenderer(getRenderer());
    },
  },
};

function getRenderer() {
  return {
    name: "@astrojs/elm",
    clientEntrypoint: "client.js",
    serverEntrypoint: "server.js",
  };
}

export default defineConfig({
  integrations: [elm],
  vite: {
    plugins: [elmPlugin()],
  },
});
