const common = require('./webpack.common');
const { merge } = require('webpack-merge');
const { dotEnvConfig } = require('./config');

module.exports = merge(common, {
	mode: 'development',
	// * 开发服务器 devServer：用来自动化，不用每次修改后都重新输入webpack打包一遍（自动编译，自动打开浏览器，自动刷新浏览器）
	// * 特点：只会在内存中编译打包，不会有任何输出（不会像之前那样在外面看到打包输出的build包，而是在内存中，关闭后会自动删除）
	devServer: {
		static: {
			// 该配置项允许配置从目录提供静态文展示的选项
			// directory: resolve('dist'),
		},
		port: dotEnvConfig.port,
		server: 'http',
		open: false,
		compress: true, // 启动gzip压缩
		hot: true, //开启HMR功能，只重新打包更改的文件
		// 开启支持vue的history模式,需要publicPath设置对（不能不设置，路径不能错误）
		// 对于history来说 返回的index.html但是是基于请求路径返回的内容,那么publicPath就基于当前请求过来的路径进行js文件请求，所以publicPath要设置为'/'
		historyApiFallback: true,
		client: {
			// 当出现编译错误或警告时，在浏览器中显示全屏覆盖。
			overlay: {
				errors: true,
				warnings: false,
				// progress: true, // 在浏览器中以百分比显示编译进度。
			},
		},
		proxy: dotEnvConfig.VUE_APP_BASE_API
			? {
					[dotEnvConfig.VUE_APP_BASE_API]: {
						// 发送请求时，请求路径重写：将/api/xxx  --> /xxx （去掉/api）
						target: 'http://10.20.150.60:8098',
						pathRewrite: {
							['^' + dotEnvConfig.VUE_APP_BASE_API]: '',
						},
					},
			  }
			: {},
	},
	// 注意：Webpack升级到5.0后，target默认值值会根据package.json中的browserslist改变，导致devServer的自动更新失效。所以development环境下直接配置成web。
	target: 'web',
	// source-map 真实代码位置
	devtool: 'source-map',
});
