import { SUMATT_TODOS, SUMATT_SUCCESS, SUMATT_FAILURE } from './constants'
/**
 * 統計出席次數用，但沒有聖徒id，搭配toltalAttend點名用，點名系統的報表/聚會資料的api
 * @param {string} meeting - 聚會項目代號，37主日，40禱告，38家聚，39小排，1473福音
 * @param {string} year_from - 從哪年
 * @param {string} month_from - 從哪月
 * @param {string} year_to - 到哪年
 * @param {string} month_to - 到哪月
 * @param {string} search - 搜尋聖徒姓名
 * @param {string} sex - 性別，m男性，f女性
 * @param {string} member_status - 狀態，enable正常，disable停用，visit來訪，moved遷出
 * @param {string} status - 身分，s聖徒，f福音朋友
 * @param {string} role - 群組，年齡層之意，學齡前、小學、中學、大專、青職、青壯、中壯、年長
 * @param {string} limit - 一次抓多少筆資料出來
 */
export function sumAttend(meeting, year_from, month_from, year_to, month_to, search, sex, member_status, status, role, limit) {
    return (dispatch) => {
        dispatch(getToDos())

        return (
            fetch(`https://www.chlife-stat.org/list_attendace.php?start=&meeting=${meeting}&search=${search}&search_col=member_name&year_from=${year_from}&month_from=${month_from}&year_to=${year_to}&month_to=${month_to}&sex=${sex}&member_status=${member_status}&status=${status}&role=${role}&birth_year=&baptized_year=&limit=${limit}&churches%5B%5D=0%2C0`, {
                method: 'GET',
                //body: JSON.stringify(data),
                headers: new Headers({
                    'cookie': 'PHPSESSID=mvgv35lnt2iulo1ut42tbku8n5'
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
        type: SUMATT_TODOS
    }
}

function getToDosSuccess(data) {
    //console.log("sumAtt_success", data)
    return {
        type: SUMATT_SUCCESS,
        data
    }
}

function getToDosFailure() {
    return {
        type: SUMATT_FAILURE
    }
}