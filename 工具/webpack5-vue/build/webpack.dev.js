const common = require('./webpack.common');
// 使用merge实现对配置的合并操作，因为Object.assign方法会将前面的同名属性直接覆盖，而我们只是希望添加一些插件，所以我们需要借助于webpack-merge模块来满足我们合并plugins的需求
const { merge } = require('webpack-merge');
const { resolve } = require('./utils');
const { devMode } = require('./config');
const Webpack = require('webpack');

module.exports = merge(common, {
	mode: 'development',
	// 开发服务器 devServer：用来自动化，不用每次修改后都重新输入webpack打包一遍（自动编译，自动打开浏览器，自动刷新浏览器）
	// 特点：只会在内存中编译打包，不会有任何输出（不会像之前那样在外面看到打包输出的build包，而是在内存中，关闭后会自动删除）
	// 启动devServer指令为：npx webpack-dev-server
	devServer: {
		// 该配置项允许配置从目录提供静态文件的选项（默认是 'public' 文件夹）。将其设置为 false 以禁用：
		static: {
			directory: resolve('dist'),
		},
		// 启动gzip压缩
		compress: true,
		port: 3000,
		open: true,
		//开启HMR功能
		hot: true,
		client: {
			// 当出现编译错误或警告时，在浏览器中显示全屏覆盖。
			overlay: {
				errors: true,
				warnings: false,
			},
			// 在浏览器中以百分比显示编译进度。
			progress: true,
		},
		// 设置代理
		// proxy: {
		// 	// 一旦devServer(5000端口)接收到/api/xxx的请求，就会用devServer起的服务把请求转发到另外一个服务器（3000）
		// 	// 以此来解决开发中的跨域问题
		// 	api: {
		// 		target: 'http://10.20.150.60:8098',
		// 		// 发送请求时，请求路径重写：将/api/xxx  --> /xxx （去掉/api）
		// 		pathRewrite: {
		// 			'^api': '',
		// 		},
		// 	},
		// },
	},
	// 注意：Webpack升级到5.0后，target默认值值会根据package.json中的browserslist改变，导致devServer的自动更新失效。所以development环境下直接配置成web。
	target: 'web',
	devtool: devMode ? false : 'eval-cheap-source-map',
	// plugins: [new Webpack.HotModuleReplacementPlugin()],
});
