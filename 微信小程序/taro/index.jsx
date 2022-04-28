import { View } from '@tarojs/components'
import { useState } from 'react'

import { getSystemInfo } from '@/components/wx/wx-custom-navigation-bar/system-Info'
import { isFunction } from '@/utils/type-check'
import Taro, { navigateBack, useDidShow } from '@tarojs/taro'

import './index.less'

let globalSystemInfo = getSystemInfo()

const WXCustomNavigationBar = (props) => {
	const {
		className,

		// 需要的功能
		back,
		home,
		title,
		searchBar,
		searchText,
		iconTheme,

		// 样式
		color,
		background,
		topBgColor,

		// 渲染html
		renderCenter,
		renderLeft,
		renderRight,

		// 返回页数
		delta,

		// 事件
		onHome,
		onSearch,
		onBack,
	} = props

	const setStyle = (systemInfo) => {
		const { statusBarHeight, navBarTotalHeight, capsulePosition, navBarExtendHeight, rightDistance, leftWidth } = systemInfo

		// 左边按钮样式
		let navBarLeft

		const { width, height } = capsulePosition
		// 只有返回按钮或者home其中一个按钮
		if ((back && !home) || (!back && home)) {
			navBarLeft = {
				width,
				height,
				marginLeft: 0,
				marginRight: rightDistance,
			}
		} else if ((back && home) || title) {
			navBarLeft = {
				width,
				height,
				marginLeft: rightDistance,
			}
		} else {
			navBarLeft = { width: 'auto', marginLeft: 0 }
		}

		return {
			// 内容区域样式
			navigationBarInnerStyle: {
				color, // 字体颜色
				height: navBarTotalHeight, // 导航栏高度
				paddingTop: statusBarHeight, // 状态栏高度
				paddingRight: leftWidth, // 胶囊按钮左侧到屏幕右侧的边距
				paddingBottom: navBarExtendHeight, // 导航栏额外高度
			},
			navBarLeft,
		}
	}

	const [configStyle, setConfigStyle] = useState({})
	const [systemInfo, setSystemInfo] = useState({})

	const { navigationBarInnerStyle, navBarLeft } = configStyle
	const { capsulePosition, ios, rightDistance, navBarTotalHeight } = systemInfo

	const containerClass = `wx-custom-navigation-bar ${className || ''} ${ios ? 'ios' : 'android'}`

	useDidShow(() => {
		if (globalSystemInfo.ios) {
			globalSystemInfo = getSystemInfo()
			setSystemInfo(globalSystemInfo)
			setConfigStyle(setStyle(globalSystemInfo))
		}
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

	const homeClick = () => {
		if (isFunction(onHome)) return onHome()
	}

	const searchClick = () => {
		if (isFunction(onSearch)) return onSearch()
	}

	let slot_center

	if (title) {
		slot_center = <text>{title}</text>
	} else if (searchBar) {
		slot_center = (
			<view className="nav-search" style={{ height: capsulePosition.height }} onClick={searchClick}>
				<view className="nav-search__icon" />
				<view className="nav-search__input">{searchText}</view>
			</view>
		)
	} else {
		slot_center = renderCenter
	}

	return (
		<View
			className={containerClass}
			style={{
				background: topBgColor ? topBgColor : background,
				height: navBarTotalHeight,
			}}
		>
			{/*占位符*/}
			<view className={`place-holder ${ios ? 'ios' : 'android'}`} style={{ paddingTop: navBarTotalHeight }} />

			{/*内容区域*/}
			<view className={`nav__inner ${ios ? 'ios' : 'android'}`} style={{ background, ...navigationBarInnerStyle }}>
				{/*左边按钮*/}
				<view className="nav__left" style={{ ...navBarLeft }}>
					{/*显示左侧按钮*/}
					{back && !home && <view onClick={backClick} className={`nav__button nav__btn_go-back ${iconTheme}`} />}

					{/*显示home*/}
					{!back && home && <view onClick={homeClick} className={`nav__button nav__btn_go-home ${iconTheme}`} />}

					{/*显示返回和home*/}
					{back && home && (
						<view className={`nav__buttons ${ios ? 'ios' : 'android'}`}>
							<view onClick={backClick} className={`nav__button nav__btn_go-back ${iconTheme}`} />
							<view onClick={homeClick} className={`nav__button nav__btn_go-home ${iconTheme}}`} />
						</view>
					)}

					{/*显示自定义渲染*/}
					{!back && !home && renderLeft}
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
	searchText: '点我搜索',
	searchBar: false,
	back: false,
	home: false,
	iconTheme: 'black',
	delta: 1,
}

export default WXCustomNavigationBar
