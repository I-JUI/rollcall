import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import app from '../Reducers'

export default function ConfigerStore() {
    let store = createStore(app, applyMiddleware(thunk))
    return store
}