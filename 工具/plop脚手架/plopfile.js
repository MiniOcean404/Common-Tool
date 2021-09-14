module.exports = (plop) => {
	plop.setGenerator('页面', {
		// 描述
		description: '创建一个页面',
		// 询问组件的名称
		prompts: [
			{
				type: 'input',
				name: 'name',
				message: '你的页面名称',
				default: 'MyPage',
			},
		],
		// 获取到回答内容后续的动作
		actions: [
			//每一个对象都是一个动作
			{
				type: 'add', // 代表添加文件
				// 被创建文件的路径及名称
				// name 为用户输入的结果，使用 {{}} 使用变量
				// properCase: plop 自带方法，将 name 转换为大驼峰
				path: 'src/components/{{ properCase name }}/index.vue',
				// 模板文件地址
				templateFile: 'templates/index.vue.hbs',
			},
			{
				type: 'add',
				path: 'src/components/{{ properCase name }}/index.scss',
				templateFile: 'templates/index.scss.hbs',
			},
			{
				type: 'add',
				path: 'src/components/{{ properCase name }}/dictionary.js',
				templateFile: 'templates/dictionary.js.hbs',
			},
			{
				type: 'add',
				path: 'src/components/{{ properCase name }}/index.js',
				templateFile: 'templates/router.js.hbs',
			},
		],
	})
}
