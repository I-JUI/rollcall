import {LEVEL3_TODOS, LEVEL3_SUCCESS, LEVEL3_FAILURE} from './constants'
/**
 * 放入level2id撈level3全部的排區架構
 * @param {string} level2_id - 第二層排區架構的id 
 */
export function districtLevel3(level2_id) {
    //console.log(level2_id)
    return (dispatch) => {
        dispatch(getToDos())

        return (
            fetch(`https://www.chlife-stat.org/list_churches.php?level=3&parent_id=${level2_id}&display_cnt=1`,{
                method: 'GET',
                //body: JSON.stringify(data),
                headers: new Headers({
                    'cookie': 'PHPSESSID=rue44eko3tk208rtm0g8fnuub4'
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
        type: LEVEL3_TODOS
    }
}

function getToDosSuccess(data) {
//console.log("level3_success", data)
    return {
        type: LEVEL3_SUCCESS,
        data
    }
}

function getToDosFailure() {
    return {
        type: LEVEL3_FAILURE
    }
}