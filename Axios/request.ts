import Axios from 'axios'
import { AxiosResponse, AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

export const axios = Axios.create({
	baseURL: '',
	timeout: 5000,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json;charset=UTF-8'
	}
})

// 请求拦截器
axios.interceptors.request.use(
	(response: AxiosRequestConfig) => {
		/**
		 * 根据你的项目实际情况来对 config 做处理
		 * 这里对 config 不做任何处理，直接返回
		 */
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
		if (typeof response.status && response.status >= 200 && response.status < 400) {
			return response
		} else {
			console.log(response, '状态码不在200-400内')
		}
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
