import { TOLATT_TODOS, TOLATT_SUCCESS, TOLATT_FAILURE } from '../Actions/constants'

const initialState = {
    todos: [],
    isFetching: false,
    error: false
}

export default function tolAttReducer(state = initialState, action) {
    //console.log("actionData",action.data)
    switch (action.type) {
        case TOLATT_TODOS:
            return {
                ...state,
                isFetching: true
            }
        case TOLATT_SUCCESS:
            return {
                ...state,
                isFetching: false,
                todos: action.data
            }

        case TOLATT_FAILURE:
            return {
                ...state,
                isFetching: false,
                error: true
            }
        default:
            return state
    }
}