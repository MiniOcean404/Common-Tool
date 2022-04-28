//获取机型环境，适配不同机型
import Taro, { getMenuButtonBoundingClientRect, getSystemInfoSync } from '@tarojs/taro'
import { isFunction } from '@/utils/type-check'

// 获取系统信息
export function getSystemInfo() {
	if (Taro.globalSystemInfo && !Taro.globalSystemInfo.ios) return Taro.globalSystemInfo

	// h5环境下忽略navbar
	if (!isFunction(getSystemInfoSync)) return null

	let systemInfo = getSystemInfoSync() || {
		model: '',
		system: '',
	}

	let ios = !!(systemInfo.system.toLowerCase().search('ios') + 1)

	let rect
	try {
		rect = getMenuButtonBoundingClientRect ? getMenuButtonBoundingClientRect() : null

		//取值为0的情况  有可能width不为0 top为0的情况
		if (rect === null || !rect.width || !rect.top || !rect.left || !rect.height) throw new Error('获取菜单按钮Rect异常')
	} catch (error) {
		let gap = 0 //胶囊按钮上下间距 使导航内容居中
		let width = 96 //胶囊的宽度

		if (systemInfo.platform === 'android') {
			gap = 8
			width = 96
		}

		if (systemInfo.platform === 'devtools') {
			if (ios) gap = 5.5 //开发工具中ios手机

			gap = 7.5 //开发工具中android和其他手机
		}

		gap = 4
		width = 88

		//开启wifi的情况下修复statusBarHeight值获取不到
		if (!systemInfo.statusBarHeight) {
			systemInfo.statusBarHeight = systemInfo.screenHeight - systemInfo.windowHeight - 20
		}

		//获取不到胶囊信息就自定义重置一个
		rect = {
			bottom: systemInfo.statusBarHeight + gap + 32,
			height: 32,
			left: systemInfo.windowWidth - width - 10,
			right: systemInfo.windowWidth - 10,
			top: systemInfo.statusBarHeight + gap,
			width: width,
		}
	}

	let navBarHeight = ''
	//开启wifi和打电话下
	if (!systemInfo.statusBarHeight) {
		systemInfo.statusBarHeight = systemInfo.screenHeight - systemInfo.windowHeight - 20
		navBarHeight = (function () {
			let gap = rect.top - systemInfo.statusBarHeight
			return 2 * gap + rect.height
		})()

		systemInfo.statusBarHeight = 0
		//下方扩展4像素高度 防止下方边距太小
		systemInfo.navBarExtendHeight = 0
	} else {
		navBarHeight = (function () {
			let gap = rect.top - systemInfo.statusBarHeight
			return systemInfo.statusBarHeight + 2 * gap + rect.height
		})()
		if (ios) {
			//下方扩展4像素高度 防止下方边距太小
			systemInfo.navBarExtendHeight = 4
		} else {
			systemInfo.navBarExtendHeight = 0
		}
	}

	systemInfo.navBarHeight = navBarHeight //导航栏高度不包括statusBarHeight
	systemInfo.capsulePosition = rect //右上角胶囊按钮信息bottom: 58 height: 32 left: 317 right: 404 top: 26 width: 87 目前发现在大多机型都是固定值 为防止不一样所以会使用动态值来计算nav元素大小
	systemInfo.ios = ios //是否ios
	Taro.globalSystemInfo = systemInfo //将信息保存到全局变量中,后边再用就不用重新异步获取了

	return systemInfo
}
