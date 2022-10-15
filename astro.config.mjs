import { defineConfig } from "astro/config";
import elmPlugin from "./vite-plugin-elm-forked/index.mjs";
import vercel from '@astrojs/vercel/serverless';

const elm = {
  name: "@astrojs/elm",
  hooks: {
    "astro:config:setup": ({ command, addRenderer, updateConfig }) => {
      addRenderer(getRenderer());
      updateConfig({
        vite: getViteConfiguration({
          isDev: command === 'dev',
        }),
      });
    },
  },
};

function getRenderer() {
  return {
    name: "@astrojs/elm",
    clientEntrypoint: "./client.js",
    serverEntrypoint: "./server.js",
  };
}

function getViteConfiguration({
  defaultOptions,
	isDev,
}) {
	return {
		optimizeDeps: {
			include: ['./client.js'],
			exclude: ['./server.js'],
		},
		plugins: [elmPlugin()],
	};
}

export default defineConfig({
  output: 'server',
  integrations: [elm],
  adapter: vercel(),
});
