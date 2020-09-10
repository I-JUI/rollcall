import { LEVEL4_TODOS, LEVEL4_SUCCESS, LEVEL4_FAILURE } from '../Actions/constants'

const initialState = {
    todos: [],
    isFetching: false,
    error: false
}

export default function level4Reducer(state = initialState, action) {
    //console.log("actionData",action.data)
    switch (action.type) {
        case LEVEL4_TODOS:
            return {
                ...state,
                isFetching: true
            }
        case LEVEL4_SUCCESS:
            return {
                ...state,
                isFetching: false,
                todos: action.data
            }

        case LEVEL4_FAILURE:
            return {
                ...state,
                isFetching: false,
                error: true
            }
        default:
            return state
    }
}