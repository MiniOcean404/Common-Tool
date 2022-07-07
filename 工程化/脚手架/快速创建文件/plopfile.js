module.exports = (plop) => {
	plop.setGenerator('component', {
		// 描述
		description: '创建一个组件',
		// 询问组件的名称
		prompts: [
			{
				type: 'input',
				name: 'name',
				message: '你的组件的名字',
				default: 'MyComponent'
			}
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
				templateFile: 'plop-templates/component.vue.hbs'
			},
			{
				type: 'add',
				path: 'src/components/{{ properCase name }}/index.scss',
				templateFile: 'plop-templates/component.scss.hbs'
			},
			{
				type: 'add',
				path: 'src/components/{{ properCase name }}/README.md',
				templateFile: 'plop-templates/README.md.hbs'
			}
		]
	})
}
