import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Canonical origin: sitemap URLs point here, never at www. or next.
  site: 'https://szymongrabowski.dev',
  // sitemap-index.xml + sitemap-0.xml with every page except the 404 page.
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
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
