import typescript from 'rollup-plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
  	extend: true,
  	file: 'dist/model.js',
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
