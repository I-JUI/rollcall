import { MEMBER_TODOS, MEMBER_SUCCESS, MEMBER_FAILURE } from '../Actions/constants'

const initialState = {
    todos: [],
    isFetching: false,
    error: false
}

export default function memberReducer(state = initialState, action) {
    //console.log("actionData",action.data)
    switch (action.type) {
        case MEMBER_TODOS:
            return {
                ...state,
                isFetching: true
            }
        case MEMBER_SUCCESS:
            return {
                ...state,
                isFetching: false,
                todos: action.data
            }

        case MEMBER_FAILURE:
            return {
                ...state,
                isFetching: false,
                error: true
            }
        default:
            return state
    }
}