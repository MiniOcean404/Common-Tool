const { resolve } = require('./utils');
const common = require('./webpack.common');
const { merge } = require('webpack-merge');

// 引入生产环境需要的插件
const CopyWebpackPlugin = require('copy-webpack-plugin'); //拷贝静态资源
// 该插件将在Webpack构建过程中搜索CSS资源，并优化\最小化CSS
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier'); // 打包提示
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const chalk = require('chalk');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { devMode } = require('./config');
const smp = new SpeedMeasurePlugin();

const mergeLate = merge(common, {
	mode: 'production',
	// eval-cheap-source-map 结合webpack的真实代码位置 source-map 源代码映射
	devtool: 'eval-cheap-source-map',
	// 打包文件性能提示
	performance: {
		hints: false, // 枚举
	},
	cache: {
		type: 'filesystem', //保存位置，开发环境下默认为memory类型，生产环境cache配置默认是关闭的。
		// 生产环境下默认的缓存存放目录在 node_modules/.cache/webpack/default-production 中，如果想要修改，可通过配置 name，来实现分类存放。如设置 name: 'production-cache' 时生成的缓存
		name: 'production-cache',
		cacheDirectory: resolve('node_modules/.cache/webpack'),
		buildDependencies: {
			config: [__filename],
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
			new TerserPlugin({
				test: /\.js(\?.*)?$/i,
				parallel: true,
				terserOptions: {
					sourceMap: true,
					compress: {
						arrows: false,
						collapse_vars: false,
						comparisons: false,
						computed_props: false,
						hoist_funs: false,
						hoist_props: false,
						hoist_vars: false,
						inline: false,
						loops: false,
						negate_iife: false,
						properties: false,
						reduce_funcs: false,
						reduce_vars: false,
						switches: false,
						toplevel: false,
						typeofs: false,
						booleans: true,
						if_return: true,
						sequences: true,
						unused: true,
						conditionals: true,
						dead_code: true,
						evaluate: true,
					},
					mangle: {
						safari10: true,
					},
				},
			}),
			new CssMinimizerPlugin(),
			new WebpackBuildNotifierPlugin({
				title: '打包任务',
				suppressSuccess: true,
			}),
			// new webpack.DllPlugin({
			// 	name: '[name]_dll',
			// 	path: resolve('dist', 'dll', 'manifest.json'), //manifest.json的生成路径
			// }),
		],
		concatenateModules: false,
		splitChunks: {
			chunks: 'all', //将什么类型的代码块用于分割，三选一： "initial"：入口代码块 | "all"：全部 | "async"：按需加载的代码块
			minSize: 20000, //大小超过30kb的模块才会被提取
			maxSize: 20000, //只是提示，可以被违反，会尽量将chunk分的比maxSize小，当设为0代表能分则分，分不了不会强制
			minChunks: 1, //某个模块至少被多少代码块引用，才会被提取成新的chunk
			maxAsyncRequests: 30, //分割后，按需加载的代码块最多允许的并行请求数
			maxInitialRequests: 30, //分割后，入口代码块最多允许的并行请求数
			automaticNameDelimiter: '~', //代码块命名分割符
			// name（默认为 true），用来决定缓存组打包得到的 chunk 名称，容易被轻视但作用很大。奇特的是它有两种类型取值，boolean 和 string：
			// 值为 true 的时候，webpack 会基于代码块和缓存组的 key 自动选择一个名称，这样一个缓存组会打包出多个 chunk。
			// 值为 false 时，适合生产模式使用，webpack 会避免对 chunk 进行不必要的命名，以减小打包体积，除了入口 chunk 外，其他 chunk 的名称都由 id 决定，所以最终看到的打包结果是一排数字命名的 js，这也是为啥我们看线上网页请求的资源，总会掺杂一些 0.js，1.js 之类的文件(当然，使资源名为数字 id 的方式不止这一种，懒加载也能轻松办到，且看下文)。
			// 值为 string 时，缓存组最终会打包成一个 chunk，名称就是该 string。此外，当两个缓存组 name 一样，最终会打包在一个 chunk 中。你甚至可以把它设为一个入口的名称，从而将这个入口会移除。
			// name: true, //每个缓存组打包得到的代码块的名称
			// 对要提取的chunk进行分组
			cacheGroups: {
				// 匹配node_modules中的三方库，将其打包成一个chunk(vendor第三方库的意思)
				libs: {
					name: 'chunk-vendor-libs',
					test: /[\\/]node_modules[\\/]/,
					priority: 1,
					chunks: 'initial', // 只打包初始时依赖的第三方
					minSize: 10000,
					minChunks: 1, //重复引入了几次
				},
				// 将至少被两个chunk引入的模块提取出来打包成单独chunk
				elementUI: {
					name: 'chunk-element-ui', // 将 elementUI 拆分为一个包
					test: /[\\/]node_modules[\\/]_?element-ui(.*)/,
					priority: 2, // 权重需要大于libs和app，否则会打包成libs或app
				},
				commons: {
					name: 'chunk-vue-components',
					test: resolve('src/components'), // 可以自定义您的规则
					minChunks: 1, //  最小块数
					priority: 3,
					reuseExistingChunk: true, //是否复用已经从原代码块中分割出来的模块
				},
				default: {
					minChunks: 2, //覆盖外层的全局属性
					priority: 3,
					reuseExistingChunk: true, //是否复用已经从原代码块中分割出来的模块
				},
				styles: {
					name: 'styles',
					test: /\.css$/,
					chunks: 'all',
					enforce: true,
				},
			},
		},
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{
					from: resolve('public'),
					to: resolve('dist'),
					toType: 'dir',
					globOptions: {
						ignore: ['.DS_Store', '**/index.html'],
					},
				},
			],
		}),
		ProgressBarPlugin({ format: `:msg [:bar] ${chalk.blue.bold(':percent')} (:elapsed s)` }),
		new MiniCssExtractPlugin({
			filename: devMode ? 'css/[name].css' : 'css/[name].[contenthash].css',
			chunkFilename: devMode ? 'css/[name].css' : 'css/[name].[contenthash].css',
			experimentalUseImportModule: false,
		}),
	],
});

// module.exports = smp.wrap(mergeLate); // 开启后vue-loader失效
module.exports = mergeLate;
