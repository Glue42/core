import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import pkg from './package.json';

export default {
    input: './src/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true
        }
    ],
    external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        'path',
        'fs',
        'child_process',
        'http'
    ], plugins: [
        typescript({
            typescript: require('typescript'),
        }),
        json(),
        commonjs(),
        resolve({ preferBuiltins: true })
    ],
};
