import fontSize from '../Component/fontSize'
import { FONTSIZE_SMALL, FONTSIZE_MEDIUM, FONTSIZE_LARGE, FONTSIZE_XLARGE } from '../Actions/constants'
const initialState = {
    ftszData: fontSize.medium,
}

export default function fontsizeReducer(state = initialState, action) {
    switch (action.type) {
        case FONTSIZE_SMALL:
            return {
                ...state,
                ftszData: fontSize.small
            }

        case FONTSIZE_MEDIUM:
            return {
                ...state,
                ftszData: fontSize.medium
            }

        case FONTSIZE_LARGE:
            return {
                ...state,
                ftszData: fontSize.large
            }

        case FONTSIZE_XLARGE:
            return {
                ...state,
                ftszData: fontSize.xlarge
            }

        default:
            return state
    }
}