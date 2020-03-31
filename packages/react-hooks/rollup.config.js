import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import cleaner from 'rollup-plugin-cleaner';
import json from 'rollup-plugin-json';
import pkg from './package.json';

const globals = {
    react: 'React',
    'react-dom': 'ReactDOM',
    'prop-types': 'PropTypes',
    '@glue42/web': 'GlueWeb',
    '@glue42/core': 'GlueCore',
};

export default {
    input: 'src/index.ts',
    output: [
        {
            file: pkg.main,
            name: 'core',
            format: 'umd',
            sourcemap: true,
            globals,
        },
        {
            file: './dist/react-glue-zero.umd.min.js',
            name: 'core.min',
            format: 'umd',
            sourcemap: true,
            globals,
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true,
            globals,
        },
    ],
    external: [
        ...Object.keys(pkg.peerDependencies || {}),
        '@glue42/web',
        '@glue42/core',
        'prop-types',
    ],
    plugins: [
        cleaner({
            targets: ['./dist/'],
        }),
        typescript({
            typescript: require('typescript'),
        }),
        terser({
            sourcemap: true,
            output: {
                comments: false,
            },
            include: [/^.+\.min\.js$/],
        }),
        // Allow json resolution
        json(),
        // // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
        commonjs(),
        // // Allow node_modules resolution, so you can use 'external' to control
        // // which external modules to include in the bundle
        // // https://github.com/rollup/rollup-plugin-node-resolve#usage
        resolve({
            mainFields: ['module', 'main', 'browser'],
        }),

        // // Resolve source maps to the original source
        // sourceMaps(),
    ],
};
