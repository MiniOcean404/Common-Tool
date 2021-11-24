// webpack.dll.js
const webpack = require('webpack');
const { resolve } = require('./utils');

module.exports = {
	mode: 'production',
	// JS 执行入口文件
	entry: {
		// 把 vue 相关模块的放到一个单独的动态链接库
		vendor: ['vue', 'axios'],
		// 其他模块放到另一个动态链接库
		// other: ['jquery', 'lodash'],
	},
	output: {
		// 输出的动态链接库的文件名称，[name] 代表当前动态链接库的名称（"vendor"和"other"）
		filename: '[name].[hash].dll.js',
		// 输出的文件都放到 dist 目录下的dll文件夹中
		path: resolve('dll'),
		// 存放动态链接库的向外暴露的变量名，例如对应 vendor 来说就是 _dll_vendor
		library: '[name]_[hash]', // 打包的库向外暴露出去的内容叫什么名字
	},
	plugins: [
		//  打包生成一个mainfest.json文件。告诉webpack哪些库不参与后续的打包，已经通过dll事先打包好了。
		new webpack.DllPlugin({
			// 动态链接库的库名，需要和 output.library 中保持一致
			// 该字段的值也就是输出的 manifest.json 文件 中 name 字段的值
			// 例如 vendor.manifest.json 中就有 "name": "vendor-[contenthash]"
			name: '[name]_[hash]',
			// 描述动态链接库的 manifest.json 文件输出时的文件名称
			path: resolve('dll/[name].manifest.json'),
		}),
	],
};

// 2.
// 在模板页index.html中引入打包好的动态链接库
// <script src="./dll/vendor.dll.js"></script>
// <script src="./dll/other.dll.js"></script>

// 3.
// webpack.config.js
// 在主程序的Webpack配置中使用webpack.DllReferencePlugin插件，读取webpack.DllPlugin生成的manifest.json文件，从中获取依赖关系。
// module.exports = {
//   mode: "production",
//   plugins: [
//     new HtmlWebpackPlugin({
//       template: "./index.html"
//     }),
//     // 告诉 Webpack 使用了哪些动态链接库
//     new webpack.DllReferencePlugin({
//       // manifest文件告诉webpack哪些库已经通过dll事先打包好了，后续构建直接去动态链接库里获取。
//       manifest: path.resolve(__dirname, "dist", "./dll/vendor.manifest.json"),
//     }),
//     new webpack.DllReferencePlugin({
//       manifest: path.resolve(__dirname, "dist", "./dll/other.manifest.json"),
//     }),
//   ],
// }
