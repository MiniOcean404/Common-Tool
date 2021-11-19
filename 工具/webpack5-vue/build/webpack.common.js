const { resolve } = require('./utils');
const { devMode } = require('./config');
const os = require('os');
const chalk = require('chalk');

// HtmlWebpackPlugin帮助你创建html文件，并自动引入打包输出的bundles文件。支持html压缩。
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 该插件将CSS提取到单独的文件中。它会为每个chunk创造一个css文件。需配合loader一起使用
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// vue-loader V15版本以上，需要引入VueLoaderPlugin插件，它的作用是将你定义过的js、css等规则应用到vue文件中去。
const { VueLoaderPlugin } = require('vue-loader');
const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length }); // 多线程打包
const ProgressBarPlugin = require('progress-bar-webpack-plugin'); //进度条
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
	mode: devMode ? 'development' : 'production',
	entry: {
		entry: [resolve('src/main.js')],
	},
	//出口文件的配置项
	output: {
		path: resolve('dist'),
		filename: 'js/[name].[hash:8].js',
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

	plugins: [
		new HtmlWebpackPlugin({
			template: resolve('public/index.html'),
			filename: 'index.html',
			favicon: resolve('public/favicon.ico'),
			minify: {
				collapseWhitespace: true, // 去掉空格
				removeComments: true, // 去掉注释
			},
		}),
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({
			filename: devMode ? '[name].css' : '[name].[hash].css',
			chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
		}),
		new HappyPack({
			id: 'js',
			cache: true,
			loaders: [
				'cache-loader',
				{
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
					},
				},
			],
			threadPool: happyThreadPool,
		}),
		new ProgressBarPlugin({ format: `:msg [:bar] ${chalk.blue.bold(':percent')} (:elapsed s)` }),
		new NodePolyfillPlugin(),
	],
	resolve: {
		extensions: ['.ts', '.js', 'scss', 'css', '.vue'],
		alias: {
			vue$: 'vue/dist/vue.runtime.esm.js',
			'@': resolve('src'),
			css: resolve('src/css'),
			api: resolve('src/api'),
			assets: resolve('src/assets'),
			common: resolve('src/common'),
			views: resolve('src/views'),
			components: resolve('src/components'),
		},
		// modules: [resolve('src'), 'node_modules'],
	},
	externals: {},
	module: {
		rules: [
			{
				test: /\.vue$/,
				use: [
					{ loader: 'cache-loader' },
					{
						loader: 'vue-loader',
						options: {
							compilerOptions: {
								preserveWhitespace: false, // 去除模板中的空格
							},
						},
					},
				],
			},
			{
				test: /\.js$/,
				use: {
					loader: 'happypack/loader?id=js',
				},
				exclude: /node_modules/,
			},
			// css文件处理
			// css-loader：将css文件整合到js文件中
			// 经过css-loader处理后，样式文件是在js文件中的
			// 问题：1.js文件体积会很大2.需要先加载js再动态创建style标签，样式渲染速度就慢，会出现闪屏现象
			// 这个loader取代style-loader。作用：提取js中的css成单独文件然后通过link加载
			{
				test: /\.css$/,
				use: [
					{ loader: 'cache-loader' },
					{
						loader: devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
						options: {
							publicPath: resolve('dist/css/'),
							hmr: devMode,
						},
					},
					'css-loader',
					{
						loader: 'postcss-loader',
					},
				],
			},
			{
				test: /.scss$/,
				// style-loader：创建style标签，将js中的样式资源插入进去，添加到head中生效
				// css-loader：将css文件变成commonjs模块加载到js中，里面内容是样式字符串
				// 处理全局变量的加载器
				use: [
					{ loader: 'cache-loader' },
					{ loader: devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader },
					{ loader: 'css-loader' },
					{
						loader: 'postcss-loader',
					},
					{ loader: 'sass-loader' },
					{
						loader: 'sass-resources-loader',
						options: {
							resources: [
								resolve('src/assets/styles/variables.scss'),
								resolve('src/assets/styles/mixin.scss'),
							],
						},
					},
				],
			},
			{
				// url-loader：处理图片资源，问题：默认处理不了html中的img图片
				test: /\.svg$/,
				loader: 'svg-sprite-loader',
				include: resolve('src/assets/icons'),
				options: {
					symbolId: 'icon-[name]',
				},
			},
			{
				// url-loader：处理图片资源，问题：默认处理不了html中的img图片
				test: /\.(jpg|png|gif|svg)$/,
				// 需要下载 url-loader file-loader
				loader: 'url-loader',
				type: 'javascript/auto', // webpack5新增type: "asset"内置模块，使用原来的方式需要加上这条
				options: {
					// 图片大小小于8kb，就会被base64处理，优点：减少请求数量（减轻服务器压力），缺点：图片体积会更大（文件请求速度更慢）
					// base64在客户端本地解码所以会减少服务器压力，如果图片过大还采用base64编码会导致cpu调用率上升，网页加载时变卡
					limit: 8 * 1024,
					// 给图片重命名，[hash:10]：取图片的hash的前10位，[ext]：取文件原来扩展名
					name: 'img.[hash:8].[ext]',
					esModule: false,
					outputPath: 'img',
				},
				exclude: resolve('src/assets/icons'),
			},
			// 图片文件处理
			{
				oneOf: [
					// 视频文件处理
					{
						test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/, //媒体文件
						exclude: /\.(html|js|ts|css|less|jpg|png|gif)/,
						type: 'javascript/auto',
						loader: 'file-loader',
						options: {
							limit: 8 * 1024,
							name: 'media.[hash:8].[ext]',
							outputPath: 'media',
						},
						// include: resolve('src'),
					},
					// 字体文件处理
					{
						test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i, //媒体文件
						exclude: /\.(html|js|ts|css|less|jpg|png|gif)/,
						type: 'javascript/auto',
						loader: 'file-loader',
						options: {
							limit: 8 * 1024,
							name: 'font.[hash:8].[ext]',
							outputPath: 'fonts',
						},
						// include: resolve('src'),
					},
				],
			},
		],
	},
	// cache: {
	// 	type: 'filesystem', //保存位置，开发环境下默认为memory类型，生产环境cache配置默认是关闭的。
	// 	buildDependencies: {
	// 		config: [__filename],
	// 	},
	// },
};
