//百宝科技计划书产品对比 分享样式调用
const wx = require('weixin-js-sdk')
import serive from 'api/request.js'
import apiList from 'api/apilist.js'

//获取分享需要的参数
export const wxShare = function(shareInfo) {
	let url = window.location.href
	let url1 = url.split('#')[0]
	let req = {
		url: encodeURIComponent(url1),
		gjsVisitTag: 'wxa'
	}

	serive({
		url: apiList.mgaList.wxShareApi,
		data: req
	}).then((res) => {
		wx.config({
			debug: false,
			jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline'],
			appId: res.appId,
			timestamp: res.timestamp,
			nonceStr: res.nonce,
			signature: res.signStr
		})

		wx.ready(function() {
			let shareData = {
				title: shareInfo.title,
				desc: shareInfo.brief,
				link: shareInfo.url,
				imgUrl: shareInfo.image
			}
			//微信好友
			wx.onMenuShareAppMessage(shareData)
			//微信朋友圈
			wx.onMenuShareTimeline(shareData)
		})
	})
}
