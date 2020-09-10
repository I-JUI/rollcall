import language from '../Component/language';
import { LANGUAGE_EN, LANGUAGE_TW } from '../Actions/constants'

const initialState = {
    lanData: language.zh,
};

export default function languageReducer(state = initialState, action) {
    //console.log('action.type',action.type);
    switch (action.type) {
        case LANGUAGE_TW:
            return {
                ...state,
                lanData: language.zh
            };

        case LANGUAGE_EN:
            //console.log('enter')
            //console.log( language.en)
            return {
                ...state,
                lanData: language.en
            };

        default:
            return state;
    }
};