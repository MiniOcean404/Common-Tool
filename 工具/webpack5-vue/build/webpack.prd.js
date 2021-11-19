const { resolve, devMode } = require('./utils');
const common = require('./webpack.common');
const { merge } = require('webpack-merge');

// 引入生产环境需要的插件
const CopyWebpackPlugin = require('copy-webpack-plugin'); //拷贝静态资源
// 该插件将在Webpack构建过程中搜索CSS资源，并优化\最小化CSS
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'); //压缩css
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin'); // 优化JS压缩时间
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const webpack = require('webpack');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier'); // 压缩js
const smp = new SpeedMeasurePlugin();

const mergeLate = merge(common, {
	mode: 'production',
	devtool: devMode ? false : 'eval-cheap-source-map',
	plugins: [
		// new CopyWebpackPlugin({
		// 	patterns: [
		// 		{
		// 			from: resolve('public'),
		// 			to: resolve('dist'),
		// 		},
		// 	],
		// }),
	],
	// 打包文件性能提示
	performance: {
		// hints: 'warning', // 枚举
		hints: false, // 枚举
		maxAssetSize: 250000, // 整数类型（以字节为单位）
		maxEntrypointSize: 250000, // 整数类型（以字节为单位）
		assetFilter: function (assetFilename) {
			return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
		},
	},
	optimization: {
		// 为块生成 id 的方法
		chunkIds: 'size',
		// 为模块生成 id 的方法
		moduleIds: 'size',
		// 将导出名称重命名为较短的名称
		mangleExports: 'size',
		minimize: true,
		minimizer: [
			// new UglifyJsPlugin({
			// 	//压缩js
			// 	cache: true,
			// 	parallel: true,
			// 	sourceMap: true,
			// }),
			new ParallelUglifyPlugin({
				cacheDir: '.cache/',
				uglifyJS: {
					output: {
						// common: true,
						beautify: false,
					},
					compress: {
						drop_console: true,
						collapse_vars: true,
						reduce_vars: true,
					},
				},
			}),
			// new TerserWebpackPlugin({
			// 	// 多进程打包
			// 	parallel: true,
			// 	terserOptions: {
			// 		// 启动source-map
			// 		sourceMap: true,
			// 	},
			// }),
			new OptimizeCssAssetsPlugin(),
			// new webpack.DllPlugin({
			// 	name: '[name]_dll',
			// 	path: resolve('dist', 'dll', 'manifest.json'), //manifest.json的生成路径
			// }),
			new WebpackBuildNotifierPlugin({
				title: '打包任务',
				// logo: resolve('./public/favicon.ico'),
				suppressSuccess: true,
			}),
		],
		concatenateModules: false,
		splitChunks: {
			chunks: 'all',
			maxInitialRequests: 6, //默认是5
			// 提取chunk最小体积
			minSize: 10000,
			maxSize: 200000,
			// 要提取的chunk最少被引用次数
			minChunks: 1,
			// 对要提取的chunk进行分组
			cacheGroups: {
				// 匹配node_modules中的三方库，将其打包成一个chunk(vendor第三方库的意思)
				libs: {
					name: 'chunk-vendor-libs',
					test: /[\\/]node_modules[\\/]/,
					priority: 10,
					chunks: 'initial', // 只打包初始时依赖的第三方
					minSize: 10000,
					minChunks: 1, //重复引入了几次
				},
				// 将至少被两个chunk引入的模块提取出来打包成单独chunk
				elementUI: {
					name: 'chunk-element-ui', // 将 elementUI 拆分为一个包
					test: /[\\/]node_modules[\\/]_?element-ui(.*)/,
					priority: 20, // 权重需要大于libs和app，否则会打包成libs或app
				},
				commons: {
					name: 'chunk-vue-components',
					test: resolve('src/components'), // 可以自定义您的规则
					minChunks: 1, //  最小块数
					priority: 5,
					reuseExistingChunk: true,
				},
			},
		},
	},
});

module.exports = smp.wrap(mergeLate); // 开启后vue-loader失效
// module.exports = mergeLate;
