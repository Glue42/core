import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import external from 'rollup-plugin-peer-deps-external';
import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";

export default [
    {
        input: 'src/export.ts',
        plugins: [
            typescript(),
            commonjs(),
            resolve({
                mainFields: ["main", "module", "browser"],
                
            }),
            external(),
            terser({
                compress: true,
            }),
            copy({
                targets: [
                    { src: './assets/css/*.css', dest: 'dist/styles' },

                ]
            })
        ],
        output: [{ dir: 'dist', format: 'es', sourcemap: true }]
    }
]