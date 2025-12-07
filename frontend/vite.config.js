import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    open: true,
    middlewareMode: false,
    cors: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['socket.io-client']
        }
      }
    },
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 500,
    css: {
      postcss: true
    }
  },
  optimize: {
    deps: {
      include: ['socket.io-client']
    }
  }
});




