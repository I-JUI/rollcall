import { TOLATT_TODOS, TOLATT_SUCCESS, TOLATT_FAILURE } from './constants'
/**
 * 撈聖徒id、當週出席狀況用，搭配sumAttend用可用來排序，點名系統點名頁面的api
 * @param {string} year - 年
 * @param {string} week - 週次
 * @param {string} start - 從哪一筆資料開始撈，通常是0
 * @param {string} limit - 一次抓多少筆資料出來
 * @param {string} sex - 性別，m男性，f女性
 * @param {string} member_status - 狀態，enable正常，disable停用，visit來訪，moved遷出
 * @param {string} status - 身分，s聖徒，f福音朋友
 * @param {string} role - 群組，年齡層之意，學齡前、小學、中學、大專、青職、青壯、中壯、年長
 * @param {string} search - 搜尋聖徒姓名
 */
export function totalAttend(year, week, start, limit, sex, member_status, status, role, search) {
    //console.log("year,week", year, week, start, limit, sex, member_status, status, role, search)
    return (dispatch) => {
        dispatch(getToDos())

        return (
            fetch(`https://www.chlife-stat.org/list_members.php?start=${start}&limit=${limit}&year=${year}&week=${week}&sex=${sex}&member_status=${member_status}&status=${status}&role=${role}&search_col=member_name&search=${search}&churches%5B%5D=0%2C0&filter_mode=churchStructureTab&roll_call_list=`,{
                method: 'GET',
                //body: JSON.stringify(data),
                headers: new Headers({
                    'cookie': 'PHPSESSID=ruddbpe6pgjvgr9poucbnb1el3'
                })
            })
            )
            .then(res => res.json())
            .then(json => {

                return (dispatch(getToDosSuccess(json)))
            })
            .catch(err => dispatch(getToDosFailure(err)))
    }
}

function getToDos() {

    return {
        type: TOLATT_TODOS
    }
}

function getToDosSuccess(data) {
//console.log("totalAtt_success", data.summary)
    return {
        type: TOLATT_SUCCESS,
        data
    }
}

function getToDosFailure() {
    return {
        type: TOLATT_FAILURE
    }
}