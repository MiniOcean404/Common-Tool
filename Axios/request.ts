import Axios from 'axios'
import { AxiosResponse, AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import http from 'http'
import https from 'https'
import qs from 'qs'

const config: AxiosRequestConfig = {
	baseURL: '',
	timeout: 5000,
	withCredentials: true,
	responseType: 'json',
	// xsrf 设置
	xsrfCookieName: 'XSRF-TOKEN',
	xsrfHeaderName: 'X-XSRF-TOKEN',
	// 最多转发数，用于node.js
	maxRedirects: 5,
	// 最大响应数据大小
	maxContentLength: 2000,
	headers: {
		'Content-Type': 'application/json;charset=UTF-8'
	},
	// 请求后的数据处理
	transformResponse: [
		function (data: AxiosResponse) {
			return data
		}
	],
	// 查询对象序列化函数
	paramsSerializer: function (params: any) {
		return qs.stringify(params)
	},
	// 自定义错误状态码范围
	validateStatus: function (status: number) {
		return status >= 200 && status < 300
	},
	// 用于node.js
	httpAgent: new http.Agent({ keepAlive: true }),
	httpsAgent: new https.Agent({ keepAlive: true })
}

export const axios = Axios.create(config)

// 取消重复请求
let pending: Array<{
	url: string
	cancel: Function
}> = []

const cancelToken = axios.CancelToken
const removePending = (config: AxiosRequestConfig) => {
	for (let p in pending) {
		let item: any = p
		let list: any = pending[p]
		// 当前请求在数组中存在时执行函数体
		if (list.url === config.url + '&request_type=' + config.method) {
			// 执行取消操作
			list.cancel()
			// 从数组中移除记录
			pending.splice(item, 1)
		}
	}
}

// 请求拦截器
axios.interceptors.request.use(
	(response: AxiosRequestConfig) => {
		/**
		 * 根据你的项目实际情况来对 config 做处理
		 * 这里对 config 不做任何处理，直接返回
		 */
		removePending(response)
		response.cancelToken = new cancelToken((c: any) => {
			pending.push({ url: response.url + '&request_type=' + response.method, cancel: c })
		})
		return response
	},
	(error: any) => {
		return Promise.reject(error)
	})

// 响应拦截器,响应拦截器中添加响应错误状态码、数据的判断
axios.interceptors.response.use(
	(response: AxiosResponse) => {
		/**
		* 根据你的项目实际情况来对 response 和 error 做处理
		* 这里对 response 和 error 不做任何处理，直接返回
		*/
		removePending(response.config)
		return response
	},
	(error: any) => {
		if (error.response && error.response.data) {
			const code = error.response.status
			const msg = error.response.data.message
			ElMessage.error(`状态码: ${code}, 错误消息: ${msg}`)
			console.error(`[Axios 错误]`, error.response)
		} else {
			ElMessage.error(`${error}`)
		}
		return Promise.reject(error)
	}
)
