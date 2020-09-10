import { REFRESH_TODOS } from '../Actions/constants';
const initialState = {
    flag: 0,
}

export default function refreshReducer(state = initialState, action) {
    switch (action.type) {
        case REFRESH_TODOS:
            return {
                ...state,
                flag: action.data
            }
        default:
            return state
    }
}