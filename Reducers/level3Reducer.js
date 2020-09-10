import {LEVEL3_TODOS, LEVEL3_SUCCESS, LEVEL3_FAILURE} from '../Actions/constants'

const initialState = {
    todos: [],
    isFetching: false,
    error: false
}

export default function level3Reducer(state = initialState, action) {
    //console.log("actionData",action.data)
    switch(action.type) {
        case LEVEL3_TODOS:
            return {
                ...state,
                isFetching: true
            }
        case LEVEL3_SUCCESS:
              return {
                ...state,
                isFetching: false,
                todos: action.data
            }
            
        case LEVEL3_FAILURE:
            return {
                ...state,
                isFetching: false,
                error: true
            }
        default:
            return state
    }
}