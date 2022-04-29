import { ADD, MINUS } from '../constants/counter'

export const add = () => {
	return {
		type: ADD,
	}
}
export const minus = () => {
	return {
		type: MINUS,
	}
}

// 异步的 actions
export function asyncAdd() {
	return (dispatch) => {
		setTimeout(() => {
			dispatch(add())
		}, 2000)
	}
}
