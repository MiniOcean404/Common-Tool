const path = require('path');

const zipName = (() => `manager-view.zip`)();

exports.zipName = zipName;

exports.prd = {
	ip: '10.10.200.212', // ssh地址
	username: 'root', // ssh 用户名
	port: '22', // 端口
	password: 'bhfae.com', // ssh 密码
	path: '/app/production_file', // 操作开始文件夹 可以直接指向配置好的地址
	// removePath: '/data/h5/admin/dist', // 需要删除的远程目录
	compressPath: path.join(__dirname, zipName), // 压缩包地址
	buildPath: path.join(__dirname, '../dist/.'), // 打包地址
};
