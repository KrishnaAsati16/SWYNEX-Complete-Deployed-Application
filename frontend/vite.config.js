import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// strictPort: the backend only allows http://localhost:5173 (CORS), so do not silently switch ports
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
