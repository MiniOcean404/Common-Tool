// camelCase: changeFormatToThis
// snakeCase: change_format_to_this
// dotCase: change.format.to.this
// pathCase: change/format/to/this
// sentenceCase: Change format to this,
// constantCase: CHANGE_FORMAT_TO_THIS
// titleCase: Change Format To This
// lowerCase: aaa
// properCase/pascalCase: Aaa
// dashCase/kebabCase: A-aa

// 运行命令：plop

module.exports = (plop) => {
    plop.setGenerator('页面', {
        // 描述
        description: '创建一个页面',
        // 询问组件的名称
        prompts: [
            {
                type: 'input',
                name: 'path',
                message: '你的页面路径',
                default: 'MyPage',
            },
        ],

        // 获取到回答内容后续的动作
        actions: (data) => {
            const {path} = data // 拿到终端输入的文件名
            const reg = /((?:\w+\/)*)(\w*)/igm
            const match = reg.exec(path)
            const name = match[2]
            const p = match[1]
            const actions = []

            let  merge
            if (name){
                merge  = `${p}/{{ properCase name }}`
            }else {
                merge = `{{ properCase name }}`
            }

            actions.push({
                type: 'add', // 代表添加文件
                // 被创建文件的路径及名称
                // name 为用户输入的结果，使用 {{}} 使用变量
                // properCase: plop 自带方法，将 name 转换为大驼峰
                path: `src/views/${merge}/{{ properCase name }}.vue`,
                // 模板文件地址
                templateFile: 'templates/index.vue.hbs',
                data: {
                    name: name,
                },
            })

            actions.push({
                type: 'add',
                path: `src/views/${merge}/index.scss`,
                templateFile: 'templates/index.scss.hbs',
                data: {
                    name: name,
                },
            })

            actions.push({
                type: 'add',
                path: `src/views/${merge}/dictionary.js`,
                templateFile: 'templates/dictionary.js.hbs',
                data: {
                    // 传递的数据给模板文件
                    name: name,
                },
            })

            actions.push({
                type: 'add',
                path: `src/views/${merge}/index.js`,
                templateFile: 'templates/router.js.hbs',
                data: {
                    name: name,
                },
            })

            // actions.push(
            // 	// 再已有的文件中append 模板内容
            // 	{
            // 		type: 'append',
            // 		path: `${FILE_PATH}/index.js`,
            // 		pattern: /[\\s\\S]*?/, // 插入内容的匹配规则
            // 		templateFile: '.setting/template/require.hbs', // 模板文件路径
            // 		data: {
            // 			// 需要告诉模板的参数值
            // 			name: fileName,
            // 		},
            // 	}
            // )

            return actions
        },
    })
}
