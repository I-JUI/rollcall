import theme from '../Component/theme'
import {
    THEME_STARWHITE, THEME_KICHENCANVA, THEME_HOMEBROWN, THEME_CLASICROSE,
    THEME_CALMBLACK, THEME_AQUABLACK, THEME_SUNSHINBLUE
} from '../Actions/constants'

const initState = {
    themeData: theme.starWhite,
}

export default function themeReducer(state = initState, action) {
    //console.log('actiontheme', action.type)
    switch (action.type) {
        case THEME_STARWHITE:
            return {
                ...state,
                themeData: theme.starWhite
            }
        case THEME_KICHENCANVA:
            return {
                ...state,
                themeData: theme.kichenCanva
            }
        case THEME_HOMEBROWN:
            return {
                ...state,
                themeData: theme.homeBrown
            }
        case THEME_CLASICROSE:
            return {
                ...state,
                themeData: theme.classicRose
            }
        case THEME_CALMBLACK:
            return {
                ...state,
                themeData: theme.calmBlack
            }
        case THEME_AQUABLACK:
            return {
                ...state,
                themeData: theme.aquaBlack
            }
        case THEME_SUNSHINBLUE:
            return {
                ...state,
                themeData: theme.sunshineBlue
            }
        default:
            return state
    }
}