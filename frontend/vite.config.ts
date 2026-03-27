import { defineConfig } from 'vite';

export default defineConfig({
  base: '/turnos/',           // <-- importante: slashes al inicio y final
  build: {
    outDir: 'dist/turnos'     // <-- ahora coincide con serve.cjs (DIST + 'turnos')
    },
  server: {
    host: true,
    port: 5173,
  }

})