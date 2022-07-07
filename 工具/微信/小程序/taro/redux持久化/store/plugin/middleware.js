import thunkMiddleware from 'redux-thunk'

export const middlewares = [thunkMiddleware]
if (process.env.NODE_ENV === 'development') middlewares.push(require('redux-logger').createLogger())
