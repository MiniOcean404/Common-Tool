const path = require('path')

exports.prd = {
	ip: '10.10.200.212', // ssh地址
	username: 'root', // ssh 用户名
	port: '22', // 端口
	password: 'bhfae.com', // ssh 密码
	// path: '/app/production_file/', // 操作开始文件夹 可以直接指向配置好的地址
	path: '/app/production_file', // 操作开始文件夹 可以直接指向配置好的地址
	localPackage: path.resolve(__dirname, 'manager-view.zip'),
	removePath: '/data/h5/admin/dist', // 需要删除的文件夹
}
