import axios from 'axios'
import Qs from 'qs'

/**
 * @描述 请求头 token
 */
export const handleRequestHeader = (config) => {
  config['xxxx'] = 'xxx'
  return config
}

export const handleAuth = (config) => {
  const token = null
  config.header['token'] = localStorage.getItem('token') || token || ''
  return config
}

/**
 * @描述 取消重复请求
 */
const pendingRequest = new Map()

// 生成取消重复请求Map中的key
function generateReqKey(config) {
  const { method, url, params, data } = config
  return [method, url, Qs.stringify(params), Qs.stringify(data)].join('&')
}

// Map中没有就添加进去
export function addPendingRequest(config) {
  const requestKey = generateReqKey(config)
  config.cancelToken =
    config.cancelToken ||
    new axios.CancelToken((cancel) => {
      if (!pendingRequest.has(requestKey)) {
        pendingRequest.set(requestKey, cancel)
      }
    })
}
// 删除重复请求
export function removePendingRequest(config) {
  const requestKey = generateReqKey(config)

  if (pendingRequest.has(requestKey)) {
    const cancelToken = pendingRequest.get(requestKey)
    cancelToken(requestKey)
    pendingRequest.delete(requestKey)
  }
}
