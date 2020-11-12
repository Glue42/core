import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import external from 'rollup-plugin-peer-deps-external';
import { terser } from "rollup-plugin-terser";
import copy from 'rollup-plugin-copy'

export default [
    {
        input: 'src/index.tsx',
        plugins: [
            resolve(),
            external(),
            commonjs(),
            typescript(),
            terser({
                compress: true,
            }),
            copy({
                targets: [
                    { src: './node_modules/@glue42/workspaces-ui-core/dist/styles/*', dest: 'dist/styles' },

                ]
            })
        ],
        output: [{ dir: 'dist', format: 'es', sourcemap: true }]
    }
]