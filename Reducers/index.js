import { combineReducers } from 'redux'

// reducers
import languageReducer from './languageReducer'//toogle language
import fontsizeReducer from './fonstsizeReducer'//toogle font size
import themeReducer from './themeReducer'// toogle theme
import gtDistrictReducer from './gtDistrictReducer'//get halls name
import loginReducer from './loginReducer'// send log in info
import tolAttReducer from './tolAttReducer'// get total attendance on main page
import level2Reducer from './level2Reducer'// get list from district level2 ex:會所區、正義區
import level3Reducer from './level3Reducer'// get list from district level3 ex:學員、青職排、大專排
import level4Reducer from './level4Reducer'// get list from district level4
import memberReducer from './memberReducer'// get all members list
import sumAttReducer from './sumAttReducer'// sum of 6 months attendance
import rollCallReducer from './rollCallReducer'// roll call
import refreshReducer from './refreshReducer'// send refresh main screen flag

const rootReducer = combineReducers({
    languageReducer, fontsizeReducer, themeReducer,
    gtDistrictReducer, loginReducer, tolAttReducer,
    level2Reducer, level3Reducer, level4Reducer,
    memberReducer, sumAttReducer, rollCallReducer,
    refreshReducer,
})

export default rootReducer