module.exports = {
	presets: [
		[
			'@babel/preset-env',
			{
				targets: {
					browsers: ['> 1%', 'last 2 versions', 'not ie <= 8'],
				},
				useBuiltIns: false,
				corejs: 3,
				modules: false,
			},
		],
	],
	plugins: [
		[
			'@babel/plugin-transform-runtime',
			{
				absoluteRuntime: false,
				corejs: 3,
				helpers: true,
				regenerator: true,
			},
		],
	],
};
