import { LANGUAGE_TW, LANGUAGE_EN } from './constants';
/**
 * 將語言設定傳到全域props
 * @param {string} text - 語言 en英文，zh繁中
 */
export function toggleLanguage(text) {
    //console.log('toggleLanguage', text)

    if (text === 'en') {
        return {
            type: LANGUAGE_EN
        }
    } else {
        return {
            type: LANGUAGE_TW
        }
    }
}