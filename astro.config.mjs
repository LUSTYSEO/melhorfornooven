// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import markdoc from '@astrojs/markdoc';
import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: vercel(),
    integrations: [
        react({
            // classic evita erro "jsxDEV is not a function" com client:only em dev
            jsxRuntime: 'classic',
        }),
        tailwind(), 
        markdoc({ allowHTML: true }),
        partytown({
            config: {
                forward: ['dataLayer.push'],
            },
        }),
    ],
    // Otimizações de build — melhora PageSpeed (CSS blocking, LCP)
    build: {
        // Injeta todo CSS como <style> inline no HTML — elimina render-blocking resources
        inlineStylesheets: 'always',
    },
    vite: {
        build: {
            cssMinify: 'esbuild',
            cssCodeSplit: true,
        },
    },
    // Reset Trigger: 2026-02-07 11:40
});


