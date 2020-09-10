import { DISTRICT_SUCCESS, DISTRICT_TODOS, DISTRICT_FALURE } from '../Actions/constants'

const initialState = {
    todos: [],
    isFetching: false,
    error: false
}

export default function gtDistrictReducer(state = initialState, action) {
    //console.log("actiondata",action.data)
    switch (action.type) {
        case DISTRICT_TODOS:
            return {
                ...state,
                isFetching: true
            }
        case DISTRICT_SUCCESS:
            return {
                ...state,
                isFetching: false,
                todos: action.data
            }
        case DISTRICT_FALURE:
            return {
                ...state,
                isFetching: false,
                error: true
            }
        default:
            return state
    }
}