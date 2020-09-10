import { ROLLCALL_TODOS, ROLLCALL_SUCCESS, ROLLCALL_FAILURE } from './constants'
import axios from 'axios'
import qs from 'qs'
/**
 * 點名，不會有回傳資料到props
 * @param {string} member_ids - 聖徒id，也可能是array，可一起傳送多人的id 
 * @param {string} meeting - 聚會項目代號，37主日，40禱告，38家聚，39小排，1473福音
 * @param {string} year - 年 
 * @param {*} week - 週數
 * @param {*} attend - 1是有來，0是沒來
 */
export function rollCall(member_ids, meeting, year, week, attend) {
    console.log("Action rollCall", member_ids, meeting, year, week, attend)
    let bodyFormData = ''
    if (typeof (member_ids) === 'object') {
        let a = ''
        let b = []
        b = member_ids
        b.forEach((value, index) => {
            a = a + 'member_ids%5B%5D=' + b[index] + '&'
        });
        a = a + 'meeting=' + meeting + '&year=' + year + '&week=' + week + '&attend=' + attend
        bodyFormData = a
    } else {
        bodyFormData = qs.stringify({
            'member_ids[]': member_ids,
            'meeting': meeting,
            'year': year,
            'week': week,
            'attend': attend,
        })
    }
    return (dispatch) => {
        dispatch(getToDos())
        return (
            axios({
                method: 'POST',
                url: 'https://www.chlife-stat.org/edit_member_activity.php',
                headers: {
                    'Cookie': 'PHPSESSID=ift1gv9olcdthmn62n3d4un0v4',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                },
                data: bodyFormData
            })
        )
            //.then(res => res.json()
            .then(json => {
                return (dispatch(getToDosSuccess(json)))
            })
            .catch(err => dispatch(getToDosFailure(err), console.log("rollCallAction", err)))
    }
}

function getToDos() {
    return {
        type: ROLLCALL_TODOS
    }
}

function getToDosSuccess(data) {
    //console.log("rollCall_success", data.summary)
    return {
        type: ROLLCALL_SUCCESS,
        data
    }
}

function getToDosFailure() {
    return {
        type: ROLLCALL_FAILURE,
    }
}