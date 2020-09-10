import { MEMBER_TODOS, MEMBER_SUCCESS, MEMBER_FAILURE } from './constants'

export function listMember(start, limit, year, week, sex, member_status, status, role, search, churches) {
    console.log("listmember", start, limit, year, week, sex, member_status, status, role, search, churches)
    return (dispatch) => {
        dispatch(getToDos())

        return (
            fetch(`https://www.chlife-stat.org/list_members.php?start=${start}&limit=${limit}&year=${year}&week=${week}&sex=${sex}&member_status=${member_status}&status=${status}&role=${role}&search_col=member_name&search=${search}&churches%5B%5D=${churches}&filter_mode=churchStructureTab&roll_call_list=`, {
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
        type: MEMBER_TODOS
    }
}

function getToDosSuccess(data) {
    //console.log("member_success", data)
    return {
        type: MEMBER_SUCCESS,
        data
    }
}

function getToDosFailure() {
    return {
        type: MEMBER_FAILURE
    }
}