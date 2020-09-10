import { DISTRICT_SUCCESS, DISTRICT_TODOS, DISTRICT_FALURE } from './constants'
/**
 * 取得台北市召會所有會所列表
 */
export function getDistrict() {
    return (dispatch) => {
        dispatch(getToDos())

        return (
            fetch('https://www.chlife-stat.org/login_select_churches.php?church_district=台北市召會'/*,{
                method: 'POST',
                body: JSON.stringify(data),
                headers: new Headers({
                    'Content-html': ''
                })
            }*/)
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
        type: DISTRICT_TODOS
    }
}

function getToDosSuccess(data) {
    //console.log("todosuccess",data)
    return {
        type: DISTRICT_SUCCESS,
        data
    }
}

function getToDosFailure() {
    return {
        type: DISTRICT_FALURE
    }
}