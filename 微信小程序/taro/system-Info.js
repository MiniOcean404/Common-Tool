// 原仓库地址：https://github.com/lingxiaoyi/Taro-navigation-bar/blob/master/src/components/navbar_lxy/index.js

//获取机型环境，适配不同机型
import { getMenuButtonBoundingClientRect, getSystemInfoSync } from '@tarojs/taro'

// mode: "default"
// benchmarkLevel: 1
// SDKVersion: "2.23.2" SDK版本
// system: "iOS 10.0.1" 系统版本
// version: "8.0.5" 微信版本
// batteryLevel: 97 电量
// enableDebug: false 是否debug
// fontSizeSetting: 16 基本字体大小
// language: "zh_CN" 语言
// locationAuthorized: true 位置授权
// locationEnabled: true 是否开启GPS
// cameraAuthorized: true 相机授权
// bluetoothEnabled: true 蓝牙是否开启
// microphoneAuthorized: true 麦克风授权
// notificationAuthorized: true 通知授权
// wifiEnabled: true WiFi开启状态
// deviceOrientation: "portrait" 设备方向
// brand: "devtools" 品牌
// model: "iPhone X" 模型
// platform: "devtools" 平台
// safeArea: {top: 44, left: 0, right: 375, bottom: 778, width: 375, …} 安全面积
// devicePixelRatio: 3 设备像素比
// pixelRatio: 3 像素比
// windowHeight: 812 窗口高度
// windowWidth: 375 窗口宽度
// screenHeight: 812 屏幕可视区高度（没有顶部菜单栏除非custom）
// screenWidth: 375 屏幕可视区宽度（没有顶部菜单栏除非custom）
// statusBarHeight: 44 状态栏高度

// 获取系统信息
let customSystemInfo
export function getSystemInfo() {
	// 如果没有信息就直接获取，有信息不是ios就返回缓存否则重新获取
	if (customSystemInfo && !customSystemInfo.ios) return customSystemInfo
	// h5环境下忽略navbar
	if (typeof getSystemInfoSync !== 'function') return null

	let systemInfo = getSystemInfoSync() || {
		model: '',
		system: '',
	}

	const { system, windowWidth } = systemInfo

	// 是否是ios环境
	const ios = !!(system.toLowerCase().search('ios') + 1)

	let rect
	rect = getMenuButtonBoundingClientRect() || null
	if (rect === null || !rect.width || !rect.top || !rect.left || !rect.height) rect = noGetMenuButtonReact(systemInfo, ios)

	let navBarExtendHeight = ''
	let navBarHeight = calculateMenuHeight(rect, systemInfo)

	if (ios) {
		// 下方扩展4像素高度 防止下方边距太小
		navBarExtendHeight = 4
	} else {
		navBarExtendHeight = 0
	}

	//开启wifi和打电话下
	if (!systemInfo.statusBarHeight) {
		navBarHeight = fixWifiCallPhone(rect, systemInfo)

		systemInfo.statusBarHeight = 0
		//下方扩展4像素高度 防止下方边距太小
		navBarExtendHeight = 0
	}

	// 自定义信息
	const customInfo = {
		navBarExtendHeight, // 额外距离
		navBarHeight, // 导航栏高度
		navBarTotalHeight: navBarExtendHeight + navBarHeight, // 导航栏总高度
		capsulePosition: rect, // 右上角胶囊按钮信息bottom: 58 height: 32 left: 317 right: 404 top: 26 width: 87 目前发现在大多机型都是固定值 为防止不一样所以会使用动态值来计算nav元素大小
		ios, // 是否ios
		rightDistance: windowWidth - rect.right, // 胶囊按钮右侧到屏幕右侧的边距
		leftWidth: windowWidth - rect.left, // 胶囊按钮左侧到屏幕右侧的边距
	}

	systemInfo = { ...systemInfo, ...customInfo }
	return (customSystemInfo = systemInfo) //将信息保存到全局变量中,后边再用就不用重新异步获取了
}

// 顶部菜单距离等于 状态栏（有刘海加刘海）高度 + 胶囊到状态栏高度（上下位置） + 胶囊高度
function calculateMenuHeight(rect, systemInfo) {
	const { top, height } = rect
	const { statusBarHeight } = systemInfo

	const gap = top - statusBarHeight
	return statusBarHeight + 2 * gap + height
}

// 开启wifi和打电话下
function fixWifiCallPhone(rect, systemInfo) {
	const { screenHeight, windowHeight } = systemInfo
	const { top, height } = rect

	systemInfo.statusBarHeight = screenHeight - windowHeight - 20

	return (function () {
		let gap = top - systemInfo.statusBarHeight
		return 2 * gap + height
	})()
}

// 处理获取不到胶囊信息
function noGetMenuButtonReact(systemInfo, ios) {
	let gap = '' // 胶囊按钮上下间距 使导航内容居中
	let width = 96 // 胶囊的宽度

	if (systemInfo.platform === 'android') {
		gap = 8
		width = 96
	} else if (systemInfo.platform === 'devtools') {
		gap = 7.5 // 开发工具中android和其他手机

		if (ios) gap = 5.5 // 开发工具中ios手机
	} else {
		gap = 4
		width = 88
	}

	const { statusBarHeight, screenHeight, windowHeight, windowWidth } = systemInfo

	// 开启wifi的情况下修复statusBarHeight值获取不到
	if (!statusBarHeight) {
		systemInfo.statusBarHeight = screenHeight - windowHeight - 20
	}

	//获取不到胶囊信息就自定义重置一个
	return {
		bottom: systemInfo.statusBarHeight + gap + 32,
		height: 32,
		left: windowWidth - width - 10,
		right: windowWidth - 10,
		top: systemInfo.statusBarHeight + gap,
		width: width,
	}
}
