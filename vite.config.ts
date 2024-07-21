import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import license from "rollup-plugin-license";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    solid(),
    license({
      sourcemap: true,

      thirdParty: {
        output: {
          file: "./temp/npm-licenses.txt",
          encoding: "utf-8",

          template(dependencies) {
            return dependencies
              .map(
                (dependency) =>
                  `${dependency.name}\nLicense: ${dependency.license}\n==========\n${dependency.licenseText}\n----------`,
              )
              .join("\n\n");
          },
        },
      },
    }),
  ],

  build: {
    rollupOptions: {
      external: [],
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
