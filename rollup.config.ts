import typescript from '@rollup/plugin-typescript';

export default {
	input: 'src/index.ts',
	output: {
		file: 'docs/index.js',
		format: 'umd',
		name: 'Table',
	},
	plugins: [
		typescript({
			declaration: false,
		}),
	],
};
