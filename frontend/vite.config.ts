import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

function getXamppHost(): string {
  try {
    // In WSL2, localhost does not reach the Windows host.
    // Read the default gateway (the Windows-side IP) so the proxy
    // can forward requests from Vite (WSL2) to XAMPP (Windows).
    const ip = execSync("ip route show default | awk '/default/ {print $3}'", {
      encoding: 'utf8',
    }).trim();
    return ip || 'localhost';
  } catch {
    return 'localhost';
  }
}

const XAMPP_HOST = getXamppHost();

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: `http://${XAMPP_HOST}/restaurant-ordering`,
        changeOrigin: true,
      },
    },
  },
});
