// 百宝科技计划书产品对比 分享样式调用
import serive from 'api/http/request';
import apiList from 'api/apilist.js';

const wx = require('weixin-js-sdk');

const jsApiList = [
	'onMenuShareAppMessage',
	'onMenuShareTimeline',
	'updateAppMessageShareData',
	'updateTimelineShareData',
];

// 获取分享需要的参数
export function wxShare(shareInfo) {
	const url = window.location.href;
	const url1 = url.split('#')[0];
	const req = {
		url: encodeURIComponent(url1),
		gjsVisitTag: 'wxa',
	};
	serive({
		url: apiList.mgaList.wxShareApi,
		data: req,
	}).then((res) => {
		wx.config({
			debug: false,
			jsApiList,
			appId: res.appId,
			timestamp: res.timestamp,
			nonceStr: res.nonce,
			signature: res.signStr,
		});

		wx.checkJsApi({
			jsApiList,
			success(result) {
				console.log('微信接口检查', result);
			},
		});

		wx.error((error) => {
			console.log('微信分享错误：', error);
		});

		wx.ready(() => {
			const shareData = {
				title: shareInfo.title,
				desc: shareInfo.brief,
				link: shareInfo.url,
				imgUrl: shareInfo.image,
			};
			// 微信好友
			wx.onMenuShareAppMessage(shareData);
			// 微信朋友圈
			wx.onMenuShareTimeline(shareData);
		});
	});
}

export default {
	wxShare,
};
