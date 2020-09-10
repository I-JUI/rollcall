import {LEVEL2_TODOS, LEVEL2_SUCCESS, LEVEL2_FAILURE} from '../Actions/constants'

const initialState = {
    todos: [],
    isFetching: false,
    error: false
}

export default function level2Reducer(state = initialState, action) {
    //console.log("actionData",action.data)
    switch(action.type) {
        case LEVEL2_TODOS:
            return {
                ...state,
                isFetching: true
            }
        case LEVEL2_SUCCESS:
              return {
                ...state,
                isFetching: false,
                todos: action.data
            }
            
        case LEVEL2_FAILURE:
            return {
                ...state,
                isFetching: false,
                error: true
            }
        default:
            return state
    }
}