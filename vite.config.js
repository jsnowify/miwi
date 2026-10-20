import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import process from 'node:process';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), {
    name: 'miwi-development-api',
    apply: 'serve',
    async configureServer(server) {
      // These values stay in the Node process; only VITE_* is exposed by Vite.
      const environment = loadEnv(mode, process.cwd(), '');
      const { createRuntime } = await import('./server/runtime.js');
      const { app } = await createRuntime(environment);
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api' || req.url?.startsWith('/api/')) return app(req, res, next);
        next();
      });
      server.config.logger.info('Miwi API and MongoDB ready in the Vite process.');
    },
  }],
  server: { host: 'localhost', port: 5173, strictPort: true },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}));
