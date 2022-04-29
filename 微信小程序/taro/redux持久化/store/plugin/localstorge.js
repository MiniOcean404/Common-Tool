import { clearStorageSync, getStorageSync, setStorageSync } from '@tarojs/taro'

export default function createWeAPPStorage() {
	return {
		getItem: (key) => {
			return new Promise((resolve) => {
				resolve(getStorageSync(key))
			})
		},
		setItem: (key, item) => {
			return new Promise((resolve) => {
				resolve(setStorageSync(key, item))
			})
		},
		removeItem: (key) => {
			return new Promise((resolve) => {
				resolve(clearStorageSync(key))
			})
		},
	}
}
