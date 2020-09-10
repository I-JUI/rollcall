import React, { Component } from 'react'
import { Provider as PaperProvider } from 'react-native-paper'// paper setting

// redux setting
import { Provider } from 'react-redux'
import ConfigerStore from './store/ConfigerStore'
import IndexRounter from './Screen/IndexRouter'

// firebase setting
import { firebaseConfig } from './Component/fbconfig'

const store = ConfigerStore()

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <PaperProvider>
          <IndexRounter />
        </PaperProvider>
      </Provider>
    )
  }
}