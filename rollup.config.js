import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/vns.ts', // Your entry TypeScript file
  output: {
    file: 'dist/vns.bundle.js',
    format: 'iife', // Bundles everything into an Immediately Invoked Function Expression
    name: 'VNS', // Name for the global variable (optional, but useful)
    sourcemap: true
  },
  plugins: [
    resolve({
      browser: true // Ensures that Rollup resolves modules as if running in the browser
    }),
    commonjs(), // Converts CommonJS modules to ES6
    typescript({ tsconfig: './tsconfig.json' }) // TypeScript plugin with your tsconfig.json settings
  ]
};