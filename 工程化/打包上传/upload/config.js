const path = require('path')

exports.dev = {
	ip: '10.10.200.217', // ssh地址
	username: 'root', // ssh 用户名
	port: '22', //端口
	password: 'bhfae.com', // ssh 密码
	path: '/data/h5/admin/dist', // 操作开始文件夹 可以直接指向配置好的地址
	removePath: '/data/h5/admin/dist', // 需要删除的文件夹
	localPackage: path.resolve(__dirname, '../dist'),
}

exports.test = {
	ip: '10.10.200.210', // ssh地址
	username: 'root', // ssh 用户名
	port: '22', //端口
	password: 'bhfae.com', // ssh 密码
	path: '/data/h5/admin/dist', // 操作开始文件夹 可以直接指向配置好的地址
	removePath: '/data/h5/admin/dist', // 需要删除的文件夹
	localPackage: path.resolve(__dirname, '../dist'),
}

exports.prd = {}
