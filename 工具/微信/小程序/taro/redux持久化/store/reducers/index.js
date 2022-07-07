// state 整个 store 的数据
import { combineReducers } from 'redux'
import counter from './counter'

export default combineReducers({
	counter,
})
