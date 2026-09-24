import { defineConfig } from 'astro/config';

export default defineConfig({
  // Static output: `npm run build` produces plain files in dist/ for Caddy/nginx.
  output: 'static',
  // Only links marked with data-astro-prefetch are prefetched (START → Command Center).
  prefetch: { prefetchAll: false },
  build: {
    // Single page with a small stylesheet: inline it and skip a render-blocking request.
    inlineStylesheets: 'always',
  },
  vite: {
    build: {
      // Keep assets as real files (cacheable), never base64 inside CSS/JS.
      assetsInlineLimit: 0,
    },
  },
});
