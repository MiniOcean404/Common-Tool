//eslint-plugin-vue: https://eslint.vuejs.org/user-guide/#faq

module.exports = {
	// ESLint 一旦发现配置文件中有 "root": true，它就会停止在父级目录中寻找。
	root: true,

	// 当访问当前源文件内未定义的变量时，no-undef 规则将发出警告。这个可以定义全局变量
	// 设置为 "writable" 以允许重写变量，或 "readonly" 不允许重写变量 "off" 禁用全局变量
	globals: { uni: true },

	// 当前书写的代码有什么样的环境
	env: {
		browser: true,
		es2021: true,
		node: true,
		es6: true,
	},

	// 表示你想使用的额外的语言特性
	parserOptions: {
		ecmaVersion: 13, // 'latest' | 11 | 2020  (不自动启用es6全局变量)
		sourceType: 'module', // 设置为 "script" (默认) 或 "module"（如果你的代码是 ECMAScript 模块)
		ecmaFeatures: {
			globalReturn: true, // 允许在全局作用域下使用 return 语句
			impliedStrict: true, // 启用全局 strict mode
			jsx: true, // 启用 JSX
		},
	},

	// 在配置文件里配置插件时，可以使用 plugins 关键字来存放插件名字的列表。插件名称可以省略 eslint-plugin- 前缀
	plugins: ['vue'],

	extends: [
		'airbnb-base',
		'plugin:vue/essential',
		'plugin:prettier/recommended',

		// 规则集合
		// 'standard', // eslint 标准配置
		// 'eslint:recommended', // 大大提高代码可读性和/或开发体验的规则
		// eslint-config-airbnb: Airbnb 公司提供的配置集
		// eslint-config-react: create react app 使用的配置集
		// eslint-config-vue: vue2 使用的配置集
		// 'plugin:vue/vue3-essential', // Vue3防止错误或意外行为的规则

		// 解决prettier 和 eslint 冲突问题
		// eslint-config-prettier: 使用这个配置集，会关闭一些可能与 Prettier 冲突的规则
		// eslint-plugin-prettier, prettier规则集 可以使用plugin:['prettier']，然后在规则中配置
		// '@vue/eslint-config-prettier',  // Vue为Prettier提供可共享的配置
	],

	settings: {
		'import/resolver': {
			webpack: {
				// 此处config对应webpack.config.js的路径，我这个路径是vue-cli3默认的路径
				config: './node_modules/@vue/cli-service/webpack.config.js',
			},
		},
	},

	// 你可以使用注释或配置文件修改你项目中要使用的规则。要改变一个规则设置
	//  "off" 或 0 - 关闭规则
	// "warn" 或 1 - 开启规则，使用警告级别的错误：warn (不会导致程序退出)
	// "error" 或 2 - 开启规则，使用错误级别的错误：error (当被触发的时候，程序会退出)
	rules: {
		'import/extensions': [
			'off',
			'always',
			{
				js: 'never',
				vue: 'never',
				ts: 'never',
			},
		],
		semi: ['error', 'always'],
		quotes: ['error', 'single'],
		// 解决console.log报错，不添加的话需要window.console.log(error);
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'max-len': ['error', { code: 300 }], // 代码最大长度
		'no-param-reassign': 'off', // 不允许对 function 的参数进行重新赋值
		'template-curly-spacing': 'off', // 要求或禁止模板字符串中的嵌入表达式周围空格的使用
		'import/no-extraneous-dependencies': 'off', // 是否导入无关依赖
		'no-tabs': 'off',
		'no-nested-ternary': 'off', // 三元表达式
		'no-else-return': 'off',
		'no-multi-assign': 'off',
		'no-plusplus': [
			// 处理 var++
			'off',
			{
				allowForLoopAfterthoughts: true,
			},
		],
		'vue/max-attributes-per-line': [
			2,
			{
				singleline: 10,
				multiline: {
					max: 1,
					allowFirstLine: false,
				},
			},
		],
		'vue/singleline-html-element-content-newline': 'off',
		'vue/multiline-html-element-content-newline': 'off',
		'vue/name-property-casing': ['error', 'PascalCase'],
		'vue/no-v-html': 'off',
		'accessor-pairs': 2,
		'arrow-spacing': [
			2,
			{
				before: true,
				after: true,
			},
		],
		'block-spacing': [2, 'always'],
		'brace-style': [
			2,
			'1tbs',
			{
				allowSingleLine: true,
			},
		],
		camelcase: [
			0,
			{
				properties: 'always',
			},
		],
		'comma-dangle': [2, 'never'],
		'comma-spacing': [
			2,
			{
				before: false,
				after: true,
			},
		],
		'comma-style': [2, 'last'],
		'constructor-super': 2,
		curly: [2, 'multi-line'],
		'dot-location': [2, 'property'],
		'eol-last': 2,
		eqeqeq: ['error', 'always', { null: 'ignore' }],
		'generator-star-spacing': [
			2,
			{
				before: true,
				after: true,
			},
		],
		'handle-callback-err': [2, '^(err|error)$'],
		indent: [
			2,
			2,
			{
				SwitchCase: 1,
			},
		],
		'jsx-quotes': [2, 'prefer-single'],
		'key-spacing': [
			2,
			{
				beforeColon: false,
				afterColon: true,
			},
		],
		'keyword-spacing': [
			2,
			{
				before: true,
				after: true,
			},
		],
		'new-cap': [
			2,
			{
				newIsCap: true,
				capIsNew: false,
			},
		],
		'new-parens': 2,
		'no-array-constructor': 2,
		'no-caller': 2,
		'no-class-assign': 2,
		'no-cond-assign': 2,
		'no-const-assign': 2,
		'no-control-regex': 0,
		'no-delete-var': 2,
		'no-dupe-args': 2,
		'no-dupe-class-members': 2,
		'no-dupe-keys': 2,
		'no-duplicate-case': 2,
		'no-empty-character-class': 2,
		'no-empty-pattern': 2,
		'no-eval': 2,
		'no-ex-assign': 2,
		'no-extend-native': 2,
		'no-extra-bind': 2,
		'no-extra-boolean-cast': 2,
		'no-extra-parens': [2, 'functions'],
		'no-fallthrough': 2,
		'no-floating-decimal': 2,
		'no-func-assign': 2,
		'no-implied-eval': 2,
		'no-inner-declarations': [2, 'functions'],
		'no-invalid-regexp': 2,
		'no-irregular-whitespace': 2,
		'no-iterator': 2,
		'no-label-var': 2,
		'no-labels': [
			2,
			{
				allowLoop: false,
				allowSwitch: false,
			},
		],
		'no-lone-blocks': 2,
		'no-mixed-spaces-and-tabs': 2,
		'no-multi-spaces': 2,
		'no-multi-str': 2,
		'no-multiple-empty-lines': [
			2,
			{
				max: 1,
			},
		],
		'no-native-reassign': 2,
		'no-negated-in-lhs': 2,
		'no-new-object': 2,
		'no-new-require': 2,
		'no-new-symbol': 2,
		'no-new-wrappers': 2,
		'no-obj-calls': 2,
		'no-octal': 2,
		'no-octal-escape': 2,
		'no-path-concat': 2,
		'no-proto': 2,
		'no-redeclare': 2,
		'no-regex-spaces': 2,
		'no-return-assign': [2, 'except-parens'],
		'no-self-assign': 2,
		'no-self-compare': 2,
		'no-sequences': 2,
		'no-shadow-restricted-names': 2,
		'no-spaced-func': 2,
		'no-sparse-arrays': 2,
		'no-this-before-super': 2,
		'no-throw-literal': 2,
		'no-trailing-spaces': 2,
		'no-undef': 2,
		'no-undef-init': 2,
		'no-unexpected-multiline': 2,
		'no-unmodified-loop-condition': 2,
		'no-unneeded-ternary': [
			2,
			{
				defaultAssignment: false,
			},
		],
		'no-unreachable': 2,
		'no-unsafe-finally': 2,
		'no-unused-vars': [
			2,
			{
				vars: 'all',
				args: 'none',
			},
		],
		'no-useless-call': 2,
		'no-useless-computed-key': 2,
		'no-useless-constructor': 2,
		'no-useless-escape': 0,
		'no-whitespace-before-property': 2,
		'no-with': 2,
		'one-var': [
			2,
			{
				initialized: 'never',
			},
		],
		'operator-linebreak': [
			2,
			'after',
			{
				overrides: {
					'?': 'before',
					':': 'before',
				},
			},
		],
		'padded-blocks': [2, 'never'],
		'semi-spacing': [
			2,
			{
				before: false,
				after: true,
			},
		],
		'space-before-blocks': [2, 'always'],
		'space-before-function-paren': [2, 'never'],
		'space-in-parens': [2, 'never'],
		'space-infix-ops': 2,
		'space-unary-ops': [
			2,
			{
				words: true,
				nonwords: false,
			},
		],
		'spaced-comment': [
			2,
			'always',
			{
				markers: ['global', 'globals', 'eslint', 'eslint-disable', '*package', '!', ','],
			},
		],
		'use-isnan': 2,
		'valid-typeof': 2,
		'wrap-iife': [2, 'any'],
		'yield-star-spacing': [2, 'both'],
		yoda: [2, 'never'],
		'prefer-const': 2,
		'object-curly-spacing': [
			2,
			'always',
			{
				objectsInObjects: false,
			},
		],
		'array-bracket-spacing': [2, 'never'],
	},
}
