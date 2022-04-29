import { View } from '@tarojs/components'
import { useState } from 'react'

import { getSystemInfo } from '@/components/wx/wx-custom-navigation-bar/system-Info'
import { isFunction } from '@/utils/type-check'
import Taro, { navigateBack, useDidShow } from '@tarojs/taro'

import './index.less'

let globalSystemInfo = getSystemInfo()

const WXCustomNavigationBar = (props) => {
	// 需要的功能
	const { back, title, iconTheme } = props
	// 样式
	const { className, color, background } = props
	// 渲染html
	const { renderCenter, renderLeft, renderRight } = props
	// 事件 返回页数
	const { onBack, delta } = props

	const [configStyle, setConfigStyle] = useState({})
	const [systemInfo, setSystemInfo] = useState(globalSystemInfo)

	const { navigationBarInnerStyle, navBarLeft } = configStyle
	const { ios, rightDistance, navBarTotalHeight, statusBarHeight, capsulePosition, navBarExtendHeight, leftWidth } = systemInfo

	const containerClass = `wx-custom-navigation-bar ${className || ''} ${ios ? 'ios' : 'android'}`
	const slot_center = title ? <text>{title}</text> : renderCenter

	useDidShow(() => {
		if (globalSystemInfo.ios) {
			globalSystemInfo = getSystemInfo()
			setSystemInfo(globalSystemInfo)
		}
		setConfigStyle(setStyle())
	})

	const backClick = () => {
		if (isFunction(onBack)) return onBack()

		const pages = Taro.getCurrentPages()
		if (pages.length >= 2) {
			navigateBack({
				delta,
			})
		}
	}

	const setStyle = () => {
		const { width, height } = capsulePosition

		return {
			// 内容区域样式
			navigationBarInnerStyle: {
				color, // 字体颜色
				height: navBarTotalHeight, // 导航栏高度
				paddingTop: statusBarHeight, // 状态栏高度
				paddingRight: leftWidth, // 胶囊按钮左侧到屏幕右侧的边距
				paddingBottom: navBarExtendHeight, // 导航栏额外高度
			},
			// 左边按钮样式
			navBarLeft: back
				? {
						width,
						height,
						marginLeft: 0,
						marginRight: rightDistance,
				  }
				: { width: 'auto', marginLeft: 0 },
		}
	}

	return (
		<View
			className={containerClass}
			style={{
				background,
				height: navBarTotalHeight,
			}}
		>
			{/*占位符*/}
			<view className={`place-holder ${ios ? 'ios' : 'android'}`} style={{ paddingTop: navBarTotalHeight }} />

			{/*内容区域*/}
			<view className={`nav__inner ${ios ? 'ios' : 'android'}`} style={{ ...navigationBarInnerStyle }}>
				{/*左边按钮*/}
				<view className="nav__left" style={{ ...navBarLeft }}>
					{/*显示左侧按钮*/}
					{back && <view onClick={backClick} className={`nav__button nav__btn_go-back ${iconTheme}`} />}

					{/*显示自定义渲染*/}
					{!back && renderLeft}
				</view>

				{/*中间显示区*/}
				<view className="nav__center" style={{ paddingLeft: rightDistance }}>
					{slot_center}
				</view>

				{/*右侧按钮*/}
				<view className="nav__right" style={{ marginRight: rightDistance }}>
					{renderRight}
				</view>
			</view>
		</View>
	)
}

WXCustomNavigationBar.propTypes = {}

WXCustomNavigationBar.defaultProps = {
	className: '',
	background: 'rgba(255,255,255,1)', //导航栏背景
	color: '#000000',
	title: '',
	back: false,
	theme: 'black', // black 或者 white
	delta: 1,
}

export default WXCustomNavigationBar
