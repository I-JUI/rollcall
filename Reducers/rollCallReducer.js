import { ROLLCALL_TODOS, ROLLCALL_SUCCESS, ROLLCALL_FAILURE } from '../Actions/constants'

const initialState = {
    todos: [],
    isFetching: false,
    error: false
}

export default function rollCallReducer(state = initialState, action) {
    //console.log("actionData",action.data)
    switch (action.type) {
        case ROLLCALL_TODOS:
            return {
                ...state,
                isFetching: true
            }
        case ROLLCALL_SUCCESS:
            return {
                ...state,
                isFetching: false,
                todos: action.data
            }

        case ROLLCALL_FAILURE:
            return {
                ...state,
                isFetching: false,
                error: true
            }
        default:
            return state
    }
}