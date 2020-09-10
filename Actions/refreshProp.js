import { REFRESH_TODOS } from './constants';
/**
 * flag每有變動，有在監控prevProps.refreshFlag的頁面會刷新
 * @param {int} flag - 刷新用旗標 
 * @returns 傳回輸入的刷新用flag到props
 */
export function refreshProp(flag) {
    return {
        type: REFRESH_TODOS,
        data: flag,
    }
}