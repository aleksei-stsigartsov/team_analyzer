import {defineConfig} from 'vite'
import {svelte} from '@sveltejs/vite-plugin-svelte'
import resolve from 'vite-plugin-resolve'
import preprocess from "svelte-preprocess"
import commonjs from 'vite-plugin-commonjs'
import {NodeGlobalsPolyfillPlugin} from '@esbuild-plugins/node-globals-polyfill'
import {NodeModulesPolyfillPlugin} from '@esbuild-plugins/node-modules-polyfill'
import { optimizeImports } from 'carbon-preprocess-svelte'

export default defineConfig({

    root: '',
    build: {emptyOutDir: true, outDir: 'public', assetsDir: 'build', publicDir: 'assets'},
    server: {
        port: 3000,
        proxy: {'/socket.io': {target: 'http://localhost:4444', changeOrigin: true, secure: false, ws: true}},
    },
    plugins: [
        svelte({
            hot: {
                preserveLocalState: true
            },
            preprocess: [
                preprocess({postcss: true}),
                optimizeImports(),
            ],
        }),
        commonjs(),
        resolve({
            browser: true,
            dedupe: ['svelte', 'svelte/transition', 'svelte/internal']
        }),
    ],
    optimizeDeps: {
        include: ['papaparse'],
        esbuildOptions: {
            define: {global: 'globalThis'},
            plugins: [
                NodeGlobalsPolyfillPlugin({process: true, buffer: true}),
                NodeModulesPolyfillPlugin()
            ]
        }
    }
})
