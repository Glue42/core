import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import pkg from './package.json';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: pkg.main,
            name: 'platform.web',
            format: 'umd',
            sourcemap: true
        },
        {
            file: './dist/platform.web.umd.min.js',
            name: 'platform.web.min',
            format: 'umd',
            sourcemap: true,
            plugins: [terser()]
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true
        },
    ],
    external: [
        //...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
    ],

    plugins: [
        typescript({
            typescript: require('typescript')
        }),
        // Allow json resolution
        json(),
        // // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
        commonjs(),
        // // Allow node_modules resolution, so you can use 'external' to control
        // // which external modules to include in the bundle
        // // https://github.com/rollup/rollup-plugin-node-resolve#usage
        resolve({
            mainFields: ['module', 'main', 'browser']
        }),

        // // Resolve source maps to the original source
        // sourceMaps(),
    ],
};
