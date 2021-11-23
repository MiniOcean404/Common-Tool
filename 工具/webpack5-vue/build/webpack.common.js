const { resolve } = require('./utils');
const { devMode, dotEnvConfig, env } = require('./config');
const pkg = require('../package.json');
const chalk = require('chalk');

const { DefinePlugin } = require('webpack');
// HtmlWebpackPlugin帮助你创建html文件，并自动引入打包输出的bundles文件。支持html压缩。
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 该插件将CSS提取到单独的文件中。它会为每个chunk创造一个css文件。需配合loader一起使用
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// vue-loader V15版本以上，需要引入VueLoaderPlugin插件，它的作用是将你定义过的js、css等规则应用到vue文件中去。
const { VueLoaderPlugin } = require('vue-loader');

const ProgressBarPlugin = require('progress-bar-webpack-plugin'); //进度条
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const threadLoader = require('thread-loader');
// const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

const jsWorkerPool = {
	// 产生的 worker 的数量，默认是 (cpu 核心数 - 1)
	// 当 require('os').cpus() 是 undefined 时，则为 1
	// workers: 2,
	// 闲置时定时删除 worker 进程,默认为 500ms,可以设置为无穷大， 这样在监视模式(--watch)下可以保持 worker 持续存在
	poolTimeout: 2000,
};

const cssWorkerPool = {
	// 一个 worker 进程中并行执行工作的数量
	// 默认为 20
	// workerParallelJobs: 2,
	poolTimeout: 2000,
};

const vueWorkerPool = {
	poolTimeout: 2000,
};

threadLoader.warmup(jsWorkerPool, ['cache-loader', 'babel-loader']);
threadLoader.warmup(vueWorkerPool, ['cache-loader', 'vue-loader']);
threadLoader.warmup(cssWorkerPool, ['cache-loader', 'css-loader', 'postcss-loader', 'sass-loader']);

module.exports = {
	entry: {
		app: [resolve('src/main.js')],
	},
	//出口文件的配置项
	output: {
		path: resolve('dist'),
		//  contenthash:根据文件内容生成hash值，文件内容改变，从而使得cache-loader,cacheDirectory失效
		//  chunckhash:根据文件块生成hash值，文件内容改变，会使得这个文件及其被引入的其他文件生成新的hash而失效
		filename: 'js/[name].[contenthash:8].js',
		//非入口文件chunk的名称。所谓非入口即import动态导入形成的chunk或者optimization中的splitChunks提取的公共chunk,它支持和 filename 一致的内置变量
		chunkFilename: 'js/common-or-noEntry.chunk.[contenthash:10].js',
		// 所有资源引入公共路径前缀，小心使用
		publicPath: '/',
		clean: true, // 打包前清空输出目录，相当于clean-webpack-plugin插件的作用,webpack5新增。
		library: {
			name: '[name]', //整个库向外暴露的变量名
			type: 'window', //库暴露的方式
		},
	},
	resolve: {
		extensions: ['.vue', '.js', '.css', '.scss', '.ts'],
		alias: {
			'@': resolve('src'),
			vue$: 'vue/dist/vue.runtime.esm.js',
			css: resolve('src/css'),
			api: resolve('src/api'),
			assets: resolve('src/assets'),
			common: resolve('src/common'),
			views: resolve('src/views'),
			components: resolve('src/components'),
			utils: resolve('src/utils'),
		},
		modules: ['node_modules'],
		mainFields: ['jsnext:main', 'browser', 'main'],
	},
	externals: {},
	module: {
		rules: [
			{
				test: /\.vue$/,
				use: [
					{
						loader: 'thread-loader',
						options: vueWorkerPool,
					},
					{
						loader: 'vue-loader',
						options: {
							compilerOptions: {
								preserveWhitespace: false, // 去除模板中的空格
								cacheDirectory: './node_modules/.cache/vue-loader',
								cacheIdentifier: `cache-loader:${pkg.version} ${env}`,
							},
						},
					},
				],
			},
			{
				test: /\.svg$/,
				exclude: /\.(html|js|ts|css|less|jpg|png|gif)/,
				include: resolve('src/assets/icons'),
				use: [
					{
						loader: 'svg-sprite-loader',
						options: {
							symbolId: 'icon-[name]',
						},
					},
				],
			},
			{
				// * oneOf 匹配一个loader后就不往下进行处理（同一个文件只能匹配一个）
				oneOf: [
					{
						test: /\.js$/,
						use: [
							{
								loader: 'thread-loader',
								options: jsWorkerPool,
							},
							{
								loader: 'babel-loader',
								options: {
									sourceMap: true,
									presets: ['@babel/preset-env'],
									cacheDirectory: true, // true 或 地址
								},
							},
						],
						exclude: /node_modules/,
					},
					// css文件处理
					// css-loader：将css文件整合到js文件中
					// 经过css-loader处理后，样式文件是在js文件中的
					// 问题：1.js文件体积会很大2.需要先加载js再动态创建style标签，样式渲染速度就慢，会出现闪屏现象
					// 这个loader取代style-loader。作用：提取js中的css成单独文件然后通过link加载
					{
						test: /\.(sa|sc|c)ss$/,
						use: [
							{
								// * vue-style-loader 和 style-loader内部实现了css的hmr功能
								loader: devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
								options: devMode
									? {
											sourceMap: true,
											shadowMode: false,
									  }
									: {
											publicPath: '/',
											esModule: false,
									  },
							},
							{
								loader: 'cache-loader',
								options: {
									cacheDirectory: './node_modules/.cache/css-loader',
								},
							},
							//thread-loader 放在了 style-loader 之后，这是因为 thread-loader 后的 loader 没法存取文件也没法获取 webpack 的选项设置
							{
								loader: 'thread-loader',
								options: cssWorkerPool,
							},
							{
								loader: 'css-loader',
								options: {
									importLoaders: 2,
									sourceMap: true,
									modules: {
										// scss分享变量给js
										// :export {
										//   color: $color;
										// }
										compileType: 'icss',
									},
								},
							},
							{
								loader: 'postcss-loader',
								options: {
									sourceMap: true,
								},
							},
							{
								loader: 'sass-loader',
								options: {
									// scss自动import全局文件
									// 		additionalData: `
									//   @import "src/scss-vars.scss";
									// `,
									sassOptions: {
										includePaths: [resolve()],
									},
								},
							},
							// {
							// 	loader: 'sass-resources-loader',
							// 	options: {
							// 		resources: [
							// 			resolve('src/assets/styles/variables.scss'),
							// 			resolve('src/assets/styles/mixin.scss'),
							// 		],
							// 	},
							// },
						],
					},
					{
						test: /\.svg$/,
						exclude: resolve('src/assets/icons'),
						type: 'javascript/auto',
						loader: 'file-loader',
						options: {
							limit: 4 * 1024,
							name: 'svg/svg.[contenthash:8].[ext]',
						},
					},
					{
						test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/, //媒体文件
						exclude: /\.(html|js|ts|css|less|jpg|png|gif)/,
						type: 'javascript/auto',
						loader: 'url-loader',
						options: {
							limit: 4 * 1024,
							name: 'media/media.[contenthash:8].[ext]',
							fallback: {
								loader: 'file-loader',
								options: {
									name: 'media/[name].[contenthash:8].[ext]',
								},
							},
						},
					},
					{
						test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i, //媒体文件
						exclude: /\.(html|js|ts|css|less|jpg|png|gif)/,
						type: 'javascript/auto',
						loader: 'file-loader',
						options: {
							limit: 4 * 1024,
							name: 'fonts/font.[hash:8].[ext]',
							fallback: {
								loader: 'file-loader',
								options: {
									name: 'fonts/font.[contenthash:8].[ext]',
								},
							},
						},
					},
					{
						// url-loader：处理图片资源，问题：默认处理不了html中的img图片
						test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
						// 需要下载 url-loader file-loader
						loader: 'url-loader',
						type: 'javascript/auto', // webpack5新增type: "asset"内置模块，使用原来的方式需要加上这条
						options: {
							// 图片大小小于8kb，就会被base64处理，优点：减少请求数量（减轻服务器压力），缺点：图片体积会更大（文件请求速度更慢）
							// base64在客户端本地解码所以会减少服务器压力，如果图片过大还采用base64编码会导致cpu调用率上升，网页加载时变卡
							limit: 4 * 1024,
							// 给图片重命名，[hash:10]：取图片的hash的前10位，[ext]：取文件原来扩展名
							name: 'img/img.[contenthash:8].[ext]',
							esModule: false,
							fallback: {
								loader: 'file-loader',
								options: {
									name: 'img/[name].[contenthash:8].[ext]',
								},
							},
						},
					},
				],
			},
		],
	},
	plugins: [
		// 设置全局变量
		new DefinePlugin({
			'process.env': JSON.stringify(dotEnvConfig),
		}),
		new HtmlWebpackPlugin({
			template: resolve('public/index.html'),
			filename: 'index.html',
			title: dotEnvConfig.VUE_APP_TITLE || '.env中未配置',
			// 对html进行压缩
			minify: {
				collapseWhitespace: true, // 去掉空格
				removeComments: true, // 去掉注释
			},
		}),
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({
			filename: devMode ? 'css/[name].css' : 'css/[name].[contenthash].css',
			chunkFilename: devMode ? 'css/[name].css' : 'css/[name].[contenthash].css',
			experimentalUseImportModule: false,
		}),
		new NodePolyfillPlugin(),
		new ProgressBarPlugin({ format: `:msg [:bar] ${chalk.blue.bold(':percent')} (:elapsed s)` }),
		// new HardSourceWebpackPlugin(),
		// new HardSourceWebpackPlugin.ExcludeModulePlugin([]),
	],
};
