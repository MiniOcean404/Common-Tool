import { Component } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import configStore from './store'

import './app.less'

const { store, persist } = configStore()

class App extends Component {
	componentDidMount() {}

	componentDidShow() {}

	componentDidHide() {}

	componentDidCatchError() {}

	// this.props.children 是将要会渲染的页面
	render() {
		return (
			<Provider store={store}>
				<PersistGate loading={null} persistor={persist}>
					{this.props.children}
				</PersistGate>
			</Provider>
		)
	}
}

export default App
