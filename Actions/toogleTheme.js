import {
    THEME_STARWHITE, THEME_SUNSHINBLUE, THEME_AQUABLACK, THEME_CALMBLACK,
    THEME_CLASICROSE, THEME_HOMEBROWN, THEME_KICHENCANVA
} from './constants'
/**
 * 將主題顏色設定傳到全域props
 * @param {string} text -  主題顏色
 */
export function toogleTheme(text) {
    //console.log('toogletheme', text)
    if (text === 'kichenCanva') {
        return {
            type: THEME_KICHENCANVA
        };
    } else if (text === 'sunshineBlue') {
        return {
            type: THEME_SUNSHINBLUE
        };
    } else if (text === 'aquaBlack') {
        return {
            type: THEME_AQUABLACK
        };
    } else if (text === 'calmBlack') {
        return {
            type: THEME_CALMBLACK
        };
    } else if (text === 'clasicRose') {
        return {
            type: THEME_CLASICROSE
        };
    } else if (text === 'homeBrown') {
        return {
            type: THEME_HOMEBROWN
        };
    } else {
        return {
            type: THEME_STARWHITE
        };
    }
}