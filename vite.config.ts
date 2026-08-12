/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Content-Security-Policy for the built site (SEC-M1-STORAGE-001).
 *
 * The consent gate is a JavaScript control — it governs the code we wrote, and
 * nothing else. This policy is the browser-enforced second layer: even if a
 * compromised dependency injected a script tag, an origin outside this list
 * cannot execute.
 *
 * Every origin here is one the architecture already names:
 *  - platform.twitter.com / cdn.syndication.twimg.com — the X widget bundle
 *  - www.facebook.com / syndication.twitter.com — the share and timeline iframes
 *  - api.open-meteo.com / api.worldbank.org — the two jQuery REST upstreams
 *  - fonts.googleapis.com / fonts.gstatic.com — the webfonts index.html loads
 *
 * `style-src` needs 'unsafe-inline' because React writes inline `style`
 * attributes; there is no nonce mechanism for those. `script-src` deliberately
 * does *not* allow it.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' https://platform.twitter.com https://cdn.syndication.twimg.com",
  "frame-src https://www.facebook.com https://platform.twitter.com https://syndication.twitter.com",
  "connect-src 'self' https://api.open-meteo.com https://api.worldbank.org https://cdn.syndication.twimg.com",
  "img-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://platform.twitter.com",
  "font-src 'self' https://fonts.gstatic.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

/**
 * Injects the CSP into the built `index.html` only.
 *
 * Build-only by design: the dev server serves an inline React Refresh preamble
 * and relies on eval for HMR, both of which this policy forbids. Shipping the
 * meta tag in dev would break the dev server for no security benefit — the
 * policy protects the artifact that actually gets served to visitors.
 */
function contentSecurityPolicyPlugin(): Plugin {
  return {
    name: 'refuture-inject-csp',
    apply: 'build',
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: {
            'http-equiv': 'Content-Security-Policy',
            content: CONTENT_SECURITY_POLICY,
          },
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), contentSecurityPolicyPlugin()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
});
