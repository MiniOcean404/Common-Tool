import { persistReducer } from 'redux-persist'
import createWeAPPStorage from '@/store/plugin/localstorge'
import rootReducer from '@/store/reducers'

const persistConfig = {
	key: 'root', // 必须有的
	storage: createWeAPPStorage(), // 缓存机制
	// blacklist: ['loginStatus'] reducer 里不持久化的数据,除此外均为持久化数据
	// whitelist: ['loginStatus'], // reducer 里持久化的数据,除此外均为不持久化数据
}

export const persistedReducer = persistReducer(persistConfig, rootReducer)
