import { View } from '@tarojs/components'
import { useState } from 'react'

import { getSystemInfo } from '@/utils/system-Info'
import { isFunction } from '@/utils/type-check'
import Taro, { navigateBack, useDidShow } from '@tarojs/taro'

import './index.less'

let globalSystemInfo = getSystemInfo()

const WXCustomNavigationBar = (props) => {
	const {
		className,

		back,
		home,
		title,
		color,
		background,
		topBgColor,

		searchBar,
		searchText,
		iconTheme,

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
		const { statusBarHeight, navBarHeight, capsulePosition, navBarExtendHeight, ios, windowWidth } = systemInfo

		let rightDistance = windowWidth - capsulePosition.right //胶囊按钮右侧到屏幕右侧的边距
		let leftWidth = windowWidth - capsulePosition.left //胶囊按钮左侧到屏幕右侧的边距

		// 内容区域样式
		let navigationBarInnerStyle = {
			color,
			height: navBarHeight + navBarExtendHeight,
			paddingTop: statusBarHeight,
			paddingRight: leftWidth,
			paddingBottom: navBarExtendHeight,
		}

		// 左边按钮样式
		let navBarLeft = {}

		if ((back && !home) || (!back && home)) {
			navBarLeft = {
				width: capsulePosition.width,
				height: capsulePosition.height,
				marginLeft: 0,
				marginRight: rightDistance,
			}
		} else if ((back && home) || title) {
			navBarLeft = {
				width: capsulePosition.width,
				height: capsulePosition.height,
				marginLeft: rightDistance,
			}
		} else {
			navBarLeft = { width: 'auto', marginLeft: 0 }
		}

		return {
			navigationBarInnerStyle,
			navBarLeft,

			// 位置信息
			navBarHeight,
			capsulePosition,
			navBarExtendHeight,
			ios,
			rightDistance,
		}
	}

	const [configStyle, setConfigStyle] = useState(globalSystemInfo)
	const { navigationBarInnerStyle, navBarLeft, navBarHeight, capsulePosition, navBarExtendHeight, ios, rightDistance } =
		configStyle
	const containerClass = `wx-custom-navigation-bar ${className || ''} ${ios ? 'ios' : 'android'}`

	useDidShow(() => {
		if (globalSystemInfo.ios) {
			globalSystemInfo = getSystemInfo()
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
				height: navBarHeight + navBarExtendHeight,
			}}
		>
			{/*占位符*/}
			<view className={`place-holder ${ios ? 'ios' : 'android'}`} style={{ paddingTop: navBarHeight + navBarExtendHeight }} />

			{/*内容区域*/}
			<view className={`nav__inner ${ios ? 'ios' : 'android'}`} style={{ background: background, ...navigationBarInnerStyle }}>
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
