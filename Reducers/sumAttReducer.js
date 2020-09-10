import { SUMATT_TODOS, SUMATT_SUCCESS, SUMATT_FAILURE } from '../Actions/constants'

const initialState = {
    todos: [],
    isFetching: false,
    error: false
}

export default function sumAttReducer(state = initialState, action) {
    //console.log("actionData",action.data)
    switch (action.type) {
        case SUMATT_TODOS:
            return {
                ...state,
                isFetching: true
            }
        case SUMATT_SUCCESS:
            return {
                ...state,
                isFetching: false,
                todos: action.data
            }

        case SUMATT_FAILURE:
            return {
                ...state,
                isFetching: false,
                error: true
            }
        default:
            return state
    }
}