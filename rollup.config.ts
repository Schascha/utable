import typescript from '@rollup/plugin-typescript';

export default {
	input: 'src/utable.ts',
	output: {
		file: 'docs/utable.js',
		format: 'umd',
		name: 'UTable',
	},
	plugins: [
		typescript({
			declaration: false,
		}),
	],
};
