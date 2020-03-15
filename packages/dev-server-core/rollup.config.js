import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import pkg from './package.json';
import builtins from 'rollup-plugin-node-builtins';

export default {
    input: './src/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true
        },
    ],
    external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        'http'
    ], plugins: [
        typescript({
            typescript: require('typescript'),
        }),
        builtins(),
        json(),
        commonjs(),
        resolve({ preferBuiltins: true })
    ],
};
