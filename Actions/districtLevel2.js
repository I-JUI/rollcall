import { LEVEL2_TODOS, LEVEL2_SUCCESS, LEVEL2_FAILURE } from './constants'
/**
 * 放入會所id來撈level2全部的排區架構
 * @param {string} churchid - 會所id 
 */
export function districtLevel2(churchid) {
    //console.log("churchid", )
    return (dispatch) => {
        dispatch(getToDos())
        return (
            fetch(`https://www.chlife-stat.org/list_churches.php?level=2&parent_id=${churchid}display_cnt=1`,{
                method: 'GET',
                //body: JSON.stringify(data),
                headers: new Headers({
                    'cookie': 'PHPSESSID=cis3f6di8g4kq7e8i0scrffpr0'
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
        type: LEVEL2_TODOS
    }
}

function getToDosSuccess(data) {
//console.log("level2_success", data)
    return {
        type: LEVEL2_SUCCESS,
        data
    }
}

function getToDosFailure() {
    return {
        type: LEVEL2_FAILURE
    }
}