import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      input: {
        editor: fileURLToPath(new URL('./index.html', import.meta.url)),
        player: fileURLToPath(new URL('./player.html', import.meta.url)),
      },
    },
  },
});
