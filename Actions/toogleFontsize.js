import { FONTSIZE_SMALL, FONTSIZE_MEDIUM, FONTSIZE_LARGE, FONTSIZE_XLARGE } from './constants'
/**
 * 傳送字體大小到全域的props
 * @param {string} text - 字體大小，small、medium、large、XLarge 
 */
export function toogleFontsize(text) {
    if (text === 'small') {
        return {
            type: FONTSIZE_SMALL
        }
    } else if (text === 'medium') {
        return {
            type: FONTSIZE_MEDIUM
        }
    } else if (text === 'large') {
        return {
            type: FONTSIZE_LARGE
        }
    } else {
        return {
            type: FONTSIZE_XLARGE
        }
    }
}
