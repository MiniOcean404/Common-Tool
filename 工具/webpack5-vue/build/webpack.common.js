const { resolve } = require('./utils');
const { devMode, dotEnv, env } = require('./config');
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
threadLoader.warmup(cssWorkerPool, [
	'cache-loader',
	'css-loader',
	'postcss-loader',
	'sass-loader',
	'sass-resources-loader',
]);

module.exports = {
	entry: {
		main: [resolve('src/main.js')],
	},
	//出口文件的配置项
	output: {
		path: resolve('dist'),
		// webpack5使用contenthash
		filename: 'js/[name].[contenthash:8].js',
		//非入口文件chunk的名称。所谓非入口即import动态导入形成的chunk或者optimization中的splitChunks提取的公共chunk,它支持和 filename 一致的内置变量
		chunkFilename: 'js/common-or-noEntry.chunk.[contenthash:10].js',
		clean: true, // 打包前清空输出目录，相当于clean-webpack-plugin插件的作用,webpack5新增。
		library: {
			name: '[name]', //整个库向外暴露的变量名
			type: 'window', //库暴露的方式
		},
		// 所有资源引入公共路径前缀，一般用于生产环境，小心使用
		// publicPath: './',
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
		},
		// modules: ['node_modules'],
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
						loader: 'cache-loader',
						options: {
							cacheDirectory: './node_modules/.cache/vue-loader',
						},
					},
					{
						loader: 'vue-loader',
						options: {
							compilerOptions: {
								preserveWhitespace: false, // 去除模板中的空格
								cacheDirectory: './node_modules/.cache/vue-loader',
							},
						},
					},
				],
			},
			{
				test: /\.js$/,
				use: [
					{
						loader: 'thread-loader',
						options: jsWorkerPool,
					},
					{
						loader: 'cache-loader',
						options: {
							cacheDirectory: './node_modules/.cache/js-loader',
						},
					},
					{
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env'],
							cacheDirectory: './node_modules/.cache/js-loader',
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
						loader: 'cache-loader',
						options: {
							cacheDirectory: './node_modules/.cache/css-loader',
						},
					},
					{
						loader: devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
						// loader: 'vue-style-loader',
						options: {
							esModule: false,
							publicPath: '../',
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
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							sourceMap: true,
						},
					},
					{ loader: 'sass-loader' },
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
			{
				oneOf: [
					// 视频文件处理
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
					// 字体文件处理
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
				],
			},
		],
	},
	plugins: [
		// 设置全局变量
		new DefinePlugin({}),
		new HtmlWebpackPlugin({
			template: resolve('public/index.html'),
			filename: 'index.html',
			title: dotEnv.parsed.VUE_APP_TITLE || '.env中未配置',
			minify: {
				collapseWhitespace: true, // 去掉空格
				removeComments: true, // 去掉注释
			},
		}),
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({
			filename: devMode ? 'css/[name].css' : 'css/[name].[contenthash].css',
			chunkFilename: devMode ? 'css/[id].css' : 'css/[id].[contenthash].css',
			experimentalUseImportModule: false,
		}),
		new NodePolyfillPlugin(),
		new ProgressBarPlugin({ format: `:msg [:bar] ${chalk.blue.bold(':percent')} (:elapsed s)` }),
		// new HardSourceWebpackPlugin(),
		// new HardSourceWebpackPlugin.ExcludeModulePlugin([]),
	],
};
