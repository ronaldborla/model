import typescript from 'rollup-plugin-typescript';

export default {
  input: 'test/index.ts',
  output: {
    extend: true,
    file: 'test/index.js',
    format: 'umd',
    name: 'window',
    sourcemap: true
  },
  plugins: [
    typescript({
      typescript: require('typescript')
    })
  ]
}
