import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: './src/vns.ts', // Your entry TypeScript file
  output: {
    file: 'dist/vns.bundle.js',
    format: 'iife', // Bundles everything into an Immediately Invoked Function Expression
    name: 'VNS', // Name for the global variable (optional, but useful)
    sourcemap: true,
    watch: {
      clearScreen: true,
      chokidar: {
        usePolling: true
      },
      include: ['src/**', 'index.html']
    }
    },
  plugins: [
    typescript({ 
      tsconfig: './tsconfig.json'
     }) // TypeScript plugin with your tsconfig.json settings
  ]
};