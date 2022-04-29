import { applyMiddleware, compose, legacy_createStore as createStore } from 'redux'

import { middlewares } from '@/store/plugin/middleware'
import { persistedReducer } from '@/store/plugin/persist'
import { persistStore } from 'redux-persist'

// 是否开启浏览器开发者工具扩展
const composeEnhancers =
	typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
		? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
		: compose

const enhancer = composeEnhancers(applyMiddleware(...middlewares))

export default function configStore() {
	let store = createStore(persistedReducer, enhancer)
	let persist = persistStore(store)

	return {
		store,
		persist,
	}
}
