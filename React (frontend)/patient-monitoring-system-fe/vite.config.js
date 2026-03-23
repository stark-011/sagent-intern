import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";

const treatJsAsJsx = {
  name: "treat-js-files-as-jsx",
  async transform(code, id) {
    if (!id.match(/src[\\/].*\.js$/)) {
      return null;
    }

    return transformWithEsbuild(code, id, {
      loader: "jsx",
      jsx: "automatic"
    });
  }
};

export default defineConfig({
  plugins: [treatJsAsJsx, react()],
  optimizeDeps: {
    entries: ["index.html"],
    esbuildOptions: {
      loader: {
        ".js": "jsx"
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true
      }
    }
  }
});
