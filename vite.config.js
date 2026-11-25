import { defineConfig } from 'vite';
export default defineConfig({base: process.env.GITHUB_ACTIONS ? '/deadly-dozen-road-to-race-2027/' : '/', build:{outDir:'dist',emptyOutDir:true}});
