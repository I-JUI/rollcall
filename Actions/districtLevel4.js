import { LEVEL4_TODOS, LEVEL4_SUCCESS, LEVEL4_FAILURE } from './constants'
/**
 * 放入level3id撈level4全部的排區架構
 * @param {string} level3_id - 第二層排區架構的id 
 */
export function districtLevel4(level3_id) {
    //console.log(level3_id)
    return (dispatch) => {
        dispatch(getToDos())
        return (
            fetch(`https://www.chlife-stat.org/list_churches.php?level=4&parent_id=${level3_id}&display_cnt=1`, {
                method: 'GET',
                //body: JSON.stringify(data),
                headers: new Headers({
                    'cookie': 'PHPSESSID=r4ikngsb92m70g42mjo6nteph0'
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
        type: LEVEL4_TODOS
    }
}

function getToDosSuccess(data) {
    //console.log("level4_success", data)
    return {
        type: LEVEL4_SUCCESS,
        data
    }
}

function getToDosFailure() {
    return {
        type: LEVEL4_FAILURE
    }
}