import {LOGIN_SUCCESS, LOGIN_FAILURE, LOGIN_TODOS } from '../Actions/constants'

const initialState = {
    todos: [],
    isFetching: false,
    error: false
}

export default function loginReducer(state = initialState, action) {
    //console.log("actiontype",action)
    switch(action.type) {
        case LOGIN_TODOS:
            return {
                ...state,
                isFetching: true
            }
        case LOGIN_SUCCESS:
            
  
              return {
                ...state,
                isFetching: false,
                todos: action.data
            }
            
        case LOGIN_FAILURE:
            return {
                ...state,
                isFetching: false,
                error: true
            }
        default:
            return state
    }
}