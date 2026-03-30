import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // This wildcard catches EVERYTHING starting with /
      // (except for local frontend files like index.html)
      '/api': {
        target: 'http://127.0.0.1:5555',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Shorthand for standard routes if you aren't using an /api prefix:
      '/signup': 'http://127.0.0.1:5555',
      '/login': 'http://127.0.0.1:5555',
      '/logout': 'http://127.0.0.1:5555',
      '/check_session': 'http://127.0.0.1:5555',
      '/systems': 'http://127.0.0.1:5555',
      '/tasks': 'http://127.0.0.1:5555',
      '/reset': 'http://127.0.0.1:5555',
    }
  }
})