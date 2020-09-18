import React, { Component } from 'react'
import { View, StyleSheet, Alert, TextInput, ScrollView, AsyncStorage, FlatList, Share } from 'react-native'
import {
    ActivityIndicator, Button, IconButton,
    Dialog, Text, Divider, Portal, FAB, Snackbar, List
} from 'react-native-paper'

// redux
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

// actions
import { toggleLanguage } from '../Actions/toogleLanguage'
import { toogleFontsize } from '../Actions/toogleFontsize'
import { toogleTheme } from '../Actions/toogleTheme'
import { districtLevel2 } from '../Actions/districtLevel2'
import { districtLevel3 } from '../Actions/districtLevel3'
import { districtLevel4 } from '../Actions/districtLevel4'
import { totalAttend } from '../Actions/totalAttend'
import { sumAttend } from '../Actions/sumAttend'

// others
import DateTimePicker from '@react-native-community/datetimepicker';// default calender picker
import { Actions } from 'react-native-router-flux' // pages navigation
import moment from 'moment' // time
/**
 * 
 * @class VisitScreen 看望頁面
 * @extends {Component}
 */
class VisitScreen extends Component {
    state = {
        /**開關聚會頻率選項 */
        modeOp: false,
        /**聚會頻率，預設是4-5次每月 */
        lordFreq: 4,
        /**聚會頻率的顯示文字 */
        lordFreqSh: this.props.lanData.fourperm,
        /**聚會頻率2-3次的flatlist索引標籤 */
        indexThree: 0,
        /**聚會頻率1次的flatlist索引標籤 */
        indexOne: 0,
        /**聚會頻率僅召會生活的flatlist索引標籤 */
        indexNon: 0,
        /**開關dialog，性別、狀態、身分、群組 */
        alotsOp: false,
        /**性別 */
        genderSel: '',
        /**狀態，enable正常，disable停用，visit來訪，moved遷出 */
        statusSel: '',
        /**身分，s聖徒，f福音朋友 */
        identitySel: '',
        /**群組，年齡層之意，學齡前、小學、中學、大專、青職、青壯、中壯、年長 */
        groupSel: '',
        /**搜尋聖徒姓名 */
        searchData: '',
        /**開關排區架構的dialog */
        districtOp: false,
        /**第二層排區架構名稱 */
        level2: '',
        /**第二層排區架構id */
        level2id: 0,
        /**第三層排區架構名稱 */
        level3: '',
        /**第三層排區架構id */
        level3id: 0,
        /**第四層排區架構名稱 */
        level4: '',
        /**第四層排區架構id */
        level4id: 0,
        /**sumAttend匯出的聖徒主日資料 */
        sumOfLordT: [],
        /**sumAttend匯出的聖徒小排資料 */
        sumOfGroupM: [],
        /**sumAttend匯出的聖徒家聚會資料 */
        sumOfHomeM: [],
        /**給flatList顯示用，螢幕上最終處理好的資料 */
        endsort: [],
        /**開關flatlist排序依據的dialog */
        priorityOp: false,
        /**flatlist排序依據，預設主>家>排 */
        priority: '主>家>排',
        /**flatlist排序依據文字顯示，預設主>家>排 */
        prioritySh: this.props.lanData.LoHoGr,
        /**數字變動時，flatList刷新 */
        flatListRender: 0,
        /**計算一個List.Item多高，作為flatlist往下滾動位置的依據，
         * 是flatlist執行scrolltoIndex必要放的prop: getItemLayout裏面的length */
        flatListHeigh: '',
        /**分享名單用的起始年 */
        shareYearf: '',
        /**分享名單用的起始月 */
        shareMonthf: '',
        /**分享名單用的截止年 */
        shareYearT: '',
        /**分享名單用的截止月 */
        shareMonthT: ''
    }
    async componentDidMount() {
        await this.getTotalAttVist()
        await this.onPriority()
    }
    /**
     * 放入會所id來撈level2全部的排區架構
     */
    DistrictRender = async () => {
        try {
            this.props.districtLevel2(await AsyncStorage.getItem('church_id'))
            this.setState({ districtOp: true })
        } catch (e) { console.log("DistrictRender error", e) }
    }
    /**
     * 放入level2id撈level3全部的排區架構
     */
    DistrictRender2 = () => {
        const level2_id = this.state.level2id
        this.props.districtLevel3(level2_id)
    }
    /**
     * 放入level3id撈level4全部的排區架構
     */
    DistrictRender3 = () => {
        const level3_id = this.state.level3id
        this.props.districtLevel4(level3_id)
    }
    /**
     * call toltalAttend, sumAttend api
     */
    getTotalAttVist = async () => {
        const year = moment(new Date()).format("yyyy")
        const week = moment(new Date()).format("ww")
        const month = moment(new Date()).format("MM")
        await this.props.totalAttend(year, week, '0', '1', '', this.state.statusSel,
            this.state.identitySel, '', '')
        const totalFetch = await this.props.tolAtt.isFetching
        if (totalFetch === false) {
            let limit = await this.props.tolAtt.todos.count
            console.log("VisitScreen limit", limit)
            await this.props.totalAttend(year, week, '0', limit, '', this.state.statusSel,
                this.state.identitySel, '', '')
            const year_from = month - 6 > 0 ? year : year - 1
            const month_from = month - 6 > 0 ? month - 6 : month + 6
            const year_to = month - 1 > 0 ? year : year - 1
            const month_to = month - 1 > 0 ? month - 1 : 11 + month
            await this.props.sumAttend('37', year_from, month_from, year_to, month_to,
                '', '', this.state.statusSel, this.state.identitySel, '', limit)
            this.setState({ sumOfLordT: await this.props.sumAtt.todos.stats.rows })
            await this.props.sumAttend('38', year_from, month_from, year_to, month_to,
                '', '', this.state.statusSel, this.state.identitySel, '', limit)
            this.setState({ sumOfHomeM: await this.props.sumAtt.todos.stats.rows })
            await this.props.sumAttend('39', year_from, month_from, year_to, month_to,
                '', '', this.state.statusSel, this.state.identitySel, '', limit)
            this.setState({
                sumOfGroupM: await this.props.sumAtt.todos.stats.rows,
                shareYearf: year_from, shareMonthf: month_from,
                shareYearT: year_to, shareMonthT: month_to
            })
        }
    }
    /**
     * 從toltalAtt和sumAtt整合資料，合併、照聚會項目排序
     */
    orderCal = async () => {
        /**sumAtt抓資料結束時是false */
        const orderCalFetch = await this.props.sumAtt.isFetching
        /**sumAttend匯出的聖徒主日資料 */
        let origL = this.state.sumOfLordT;
        /**sumAttend匯出的聖徒家聚會資料 */
        let origH = this.state.sumOfHomeM;
        /**sumAttend匯出的聖徒小排資料 */
        let origG = this.state.sumOfGroupM
        /**純主日聚會每週數據 */
        let sumofL = [];
        /**純家聚會每週數據 */
        let sumofH = [];
        /**純小排聚會每週數據 */
        let sumofG = [];
        /**加總主日聚會每週數據 */
        let sumofL2 = [];
        /**加總家聚會每週數據 */
        let sumofH2 = [];
        /**加總小排聚會每週數據 */
        let sumofG2 = [];
        /**sumAttend裡才有，toltalAttend沒有的聖徒資訊 */
        let memInfo = []
        /**有主、家、排的加總合併聖徒資訊但尚未排序的數據 */
        let tolAttorig = []
        if (orderCalFetch === false) {
            origL.forEach((objectss) => {
                sumofL.push({
                    '21': objectss["21"] === null ? 0 : parseInt(objectss["21"]),
                    '22': objectss["22"] === null ? 0 : parseInt(objectss["22"]),
                    '23': objectss["23"] === null ? 0 : parseInt(objectss["23"]),
                    '24': objectss["24"] === null ? 0 : parseInt(objectss["24"]),
                    '25': objectss["25"] === null ? 0 : parseInt(objectss["25"]),
                    '26': objectss["26"] === null ? 0 : parseInt(objectss["26"]),
                    '27': objectss["27"] === null ? 0 : parseInt(objectss["27"]),
                    '28': objectss["28"] === null ? 0 : parseInt(objectss["28"]),
                    '29': objectss["29"] === null ? 0 : parseInt(objectss["29"]),
                    '30': objectss["30"] === null ? 0 : parseInt(objectss["30"]),
                    '31': objectss["31"] === null ? 0 : parseInt(objectss["31"]),
                    '32': objectss["32"] === null ? 0 : parseInt(objectss["32"]),
                    '33': objectss["33"] === null ? 0 : parseInt(objectss["33"]),
                    '34': objectss["34"] === null ? 0 : parseInt(objectss["34"]),
                    '35': objectss["35"] === null ? 0 : parseInt(objectss["35"]),
                    '36': objectss["36"] === null ? 0 : parseInt(objectss["36"]),
                    '37': objectss["37"] === null ? 0 : parseInt(objectss["37"]),
                    '38': objectss["38"] === null ? 0 : parseInt(objectss["38"]),
                    '39': objectss["39"] === null ? 0 : parseInt(objectss["39"])
                })
            })
            sumofL2 = sumofL.map(o => Object.keys(o).reduce((t, p) => t + o[p], 0));
            origH.forEach((objectss) => {
                sumofH.push({
                    '21': objectss["21"] === null ? 0 : parseInt(objectss["21"]),
                    '22': objectss["22"] === null ? 0 : parseInt(objectss["22"]),
                    '23': objectss["23"] === null ? 0 : parseInt(objectss["23"]),
                    '24': objectss["24"] === null ? 0 : parseInt(objectss["24"]),
                    '25': objectss["25"] === null ? 0 : parseInt(objectss["25"]),
                    '26': objectss["26"] === null ? 0 : parseInt(objectss["26"]),
                    '27': objectss["27"] === null ? 0 : parseInt(objectss["27"]),
                    '28': objectss["28"] === null ? 0 : parseInt(objectss["28"]),
                    '29': objectss["29"] === null ? 0 : parseInt(objectss["29"]),
                    '30': objectss["30"] === null ? 0 : parseInt(objectss["30"]),
                    '31': objectss["31"] === null ? 0 : parseInt(objectss["31"]),
                    '32': objectss["32"] === null ? 0 : parseInt(objectss["32"]),
                    '33': objectss["33"] === null ? 0 : parseInt(objectss["33"]),
                    '34': objectss["34"] === null ? 0 : parseInt(objectss["34"]),
                    '35': objectss["35"] === null ? 0 : parseInt(objectss["35"]),
                    '36': objectss["36"] === null ? 0 : parseInt(objectss["36"]),
                    '37': objectss["37"] === null ? 0 : parseInt(objectss["37"]),
                    '38': objectss["38"] === null ? 0 : parseInt(objectss["38"]),
                    '39': objectss["39"] === null ? 0 : parseInt(objectss["39"])
                })
            })
            sumofH2 = sumofH.map(o => Object.keys(o).reduce((t, p) => t + o[p], 0));
            origG.forEach((objectss) => {
                sumofG.push({
                    '21': objectss["21"] === null ? 0 : parseInt(objectss["21"]),
                    '22': objectss["22"] === null ? 0 : parseInt(objectss["22"]),
                    '23': objectss["23"] === null ? 0 : parseInt(objectss["23"]),
                    '24': objectss["24"] === null ? 0 : parseInt(objectss["24"]),
                    '25': objectss["25"] === null ? 0 : parseInt(objectss["25"]),
                    '26': objectss["26"] === null ? 0 : parseInt(objectss["26"]),
                    '27': objectss["27"] === null ? 0 : parseInt(objectss["27"]),
                    '28': objectss["28"] === null ? 0 : parseInt(objectss["28"]),
                    '29': objectss["29"] === null ? 0 : parseInt(objectss["29"]),
                    '30': objectss["30"] === null ? 0 : parseInt(objectss["30"]),
                    '31': objectss["31"] === null ? 0 : parseInt(objectss["31"]),
                    '32': objectss["32"] === null ? 0 : parseInt(objectss["32"]),
                    '33': objectss["33"] === null ? 0 : parseInt(objectss["33"]),
                    '34': objectss["34"] === null ? 0 : parseInt(objectss["34"]),
                    '35': objectss["35"] === null ? 0 : parseInt(objectss["35"]),
                    '36': objectss["36"] === null ? 0 : parseInt(objectss["36"]),
                    '37': objectss["37"] === null ? 0 : parseInt(objectss["37"]),
                    '38': objectss["38"] === null ? 0 : parseInt(objectss["38"]),
                    '39': objectss["39"] === null ? 0 : parseInt(objectss["39"])
                })
                memInfo.push({
                    'date_baptized': objectss['date_baptized'],
                    'role': objectss['role'],
                })
            })
            sumofG2 = sumofG.map(o => Object.keys(o).reduce((t, p) => t + o[p], 0));
        }
        const getTolFetch = await this.props.tolAtt.isFetching
        if (getTolFetch === false) {
            const item = await this.props.tolAtt.todos.members
            item.forEach((obj, index) => {
                tolAttorig.push({
                    member_name: obj['member_name'],
                    member_id: obj['member_id'],
                    path: obj['path'],
                    church_name: obj['church_name'],
                    sex: obj['sex'],
                    date_baptized: memInfo[index]['date_baptized'],
                    role: memInfo[index]['role'],
                    sumL: ((sumofL2[index]) / 4.7).toFixed(1),
                    sumH: ((sumofH2[index]) / 4.7).toFixed(1),
                    sumG: ((sumofG2[index]) / 4.7).toFixed(1)
                })
            })
        }
        this.setState({ endsort: tolAttorig })
        //console.log("endsort",this.state.endsort)
    }
    /**
     * 將flatlist要顯示的資料依據主、家、排三種聚會選擇不同的排序順位
     */
    onPriority = async () => {
        await this.orderCal()
        /**給flatList顯示用，螢幕上最終處理好的資料 */
        let sort = this.state.endsort
        /**flatlist排序依據，預設主>家>排 */
        let priority = this.state.priority
        /**聚會頻率2-3次的flatlist索引標籤 */
        let id3 = ''
        /**聚會頻率1次的flatlist索引標籤 */
        let id1 = ''
        /**聚會頻率僅召會生活的flatlist索引標籤 */
        let idNon = ''
        if (priority === '主>家>排') {
            sort.sort((a, b) => { return b.sumG - a.sumG })
            sort.sort((a, b) => { return b.sumH - a.sumH })
            sort.sort((a, b) => { return b.sumL - a.sumL })
            id3 = sort.filter(e => e.sumL <= 3.0)[0]['member_id']
            id3 = sort.findIndex(e => e.member_id === id3)
            id1 = sort.filter(e => e.sumL <= 0.9)[0]['member_id']
            id1 = sort.findIndex(e => e.member_id === id1)
            idNon = sort.filter(e => e.sumL === '0.0')[0]['member_id']
            idNon = sort.findIndex(e => e.member_id === idNon)
        } else if (priority === '主>排>家') {
            sort.sort((a, b) => { return b.sumH - a.sumH })
            sort.sort((a, b) => { return b.sumG - a.sumG })
            sort.sort((a, b) => { return b.sumL - a.sumL })
            id3 = sort.filter(e => e.sumL <= 3.0)[0]['member_id']
            id3 = sort.findIndex(e => e.member_id === id3)
            id1 = sort.filter(e => e.sumL <= 0.9)[0]['member_id']
            id1 = sort.findIndex(e => e.member_id === id1)
            idNon = sort.filter(e => e.sumL === '0.0')[0]['member_id']
            idNon = sort.findIndex(e => e.member_id === idNon)
        } else if (priority === '家>主>排') {
            sort.sort((a, b) => { return b.sumG - a.sumG })
            sort.sort((a, b) => { return b.sumL - a.sumL })
            sort.sort((a, b) => { return b.sumH - a.sumH })
            id3 = sort.filter(e => e.sumH <= 3.0)[0]['member_id']
            id3 = sort.findIndex(e => e.member_id === id3)
            id1 = sort.filter(e => e.sumH <= 0.9)[0]['member_id']
            id1 = sort.findIndex(e => e.member_id === id1)
            idNon = sort.filter(e => e.sumH === '0.0')[0]['member_id']
            idNon = sort.findIndex(e => e.member_id === idNon)
        } else if (priority === '家>排>主') {
            sort.sort((a, b) => { return b.sumL - a.sumL })
            sort.sort((a, b) => { return b.sumG - a.sumG })
            sort.sort((a, b) => { return b.sumH - a.sumH })
            id3 = sort.filter(e => e.sumH <= 3.0)[0]['member_id']
            id3 = sort.findIndex(e => e.member_id === id3)
            id1 = sort.filter(e => e.sumH <= 0.9)[0]['member_id']
            id1 = sort.findIndex(e => e.member_id === id1)
            idNon = sort.filter(e => e.sumH === '0.0')[0]['member_id']
            idNon = sort.findIndex(e => e.member_id === idNon)
        } else if (priority === '排>主>家') {
            sort.sort((a, b) => { return b.sumH - a.sumH })
            sort.sort((a, b) => { return b.sumL - a.sumL })
            sort.sort((a, b) => { return b.sumG - a.sumG })
            id3 = sort.filter(e => e.sumG <= 3.0)[0]['member_id']
            id3 = sort.findIndex(e => e.member_id === id3)
            id1 = sort.filter(e => e.sumG <= 0.9)[0]['member_id']
            id1 = sort.findIndex(e => e.member_id === id1)
            idNon = sort.filter(e => e.sumG === '0.0')[0]['member_id']
            idNon = sort.findIndex(e => e.member_id === idNon)
        } else if (priority === '排>家>主') {
            sort.sort((a, b) => { return b.sumL - a.sumL })
            sort.sort((a, b) => { return b.sumH - a.sumH })
            sort.sort((a, b) => { return b.sumG - a.sumG })
            id3 = sort.filter(e => e.sumG <= 3.0)[0]['member_id']
            id3 = sort.findIndex(e => e.member_id === id3)
            id1 = sort.filter(e => e.sumG <= 0.9)[0]['member_id']
            id1 = sort.findIndex(e => e.member_id === id1)
            idNon = sort.filter(e => e.sumG === '0.0')[0]['member_id']
            idNon = sort.findIndex(e => e.member_id === idNon)
        }
        this.setState({
            endsort: sort, priorityOp: false,
            indexThree: id3, indexOne: id1, indexNon: idNon
        })
        this.setState(prevState => ({ flatListRender: prevState.flatListRender + 1 }))
    }
    /**
     * 選擇要跳到哪個聚會頻率的區間
     */
    onFrequency = () => {
        this.setState({ modeOp: false })
        /**聚會頻率，預設是4-5次每月 */
        let freq = this.state.lordFreq
        /**flatlist要滾動到的位置 */
        let index = 0
        if (freq === 3) {
            index = this.state.indexThree
        } else if (freq === 2) {
            index = this.state.indexOne
        } else if (freq === 1) {
            index = this.state.indexNon
        }
        this.myScroll.scrollToIndex({ animated: true, index: index })
    }
    /**
     * 照性別、狀態、身分、群組、搜尋、排區架構篩選 
     * */
    filterArray = async () => {
        console.log("searchData",this.state.searchData)
        this.setState({ alotsOp: false, districtOp: false })
        if (this.state.statusSel || this.state.identitySel) {
            await this.getTotalAttVist()
            await this.onPriority()
        } else {
            await this.onPriority()
            let endsort = this.state.endsort
            let temp = []
            const ttmp = JSON.stringify(this.state.level2id + this.state.level3id + this.state.level4id).length
            if (this.state.level2id || this.state.level3id || this.state.level4id) {
                if (ttmp === 8) {
                    temp = endsort.filter(e => e.path.split(',')[1] === this.state.level2id)
                    endsort = temp
                } else if (ttmp === 11) {
                    temp = endsort.filter(e => e.path.split(',')[2] === this.state.level3id)
                    endsort = temp
                } else if (ttmp === 14) {
                    temp = endsort.filter(e => e.path.split(',')[3] === this.state.level4id)
                    endsort = temp
                }
            }
            if (this.state.searchData !== '') {
                temp = endsort.filter(e => e.member_name.includes(this.state.searchData))
                endsort = temp
            }
            if (this.state.genderSel === 'f') {
                temp = endsort.filter(e => e.sex === '女')
                endsort = temp
            } else if (this.state.genderSel === 'm') {
                temp = endsort.filter(e => e.sex === '男')
                endsort = temp
            }
            if (this.state.groupSel === '學齡前') {
                temp = endsort.filter(e => e.role === '學齡前')
                endsort = temp
            } else if (this.state.groupSel === '小學') {
                temp = endsort.filter(e => e.role === '小學')
                endsort = temp
            } else if (this.state.groupSel === '中學') {
                temp = endsort.filter(e => e.role === '中學')
                endsort = temp
            } else if (this.state.groupSel === '大專') {
                temp = endsort.filter(e => e.role === '大專')
                endsort = temp
            } else if (this.state.groupSel === '青職') {
                temp = endsort.filter(e => e.role === '青職')
                endsort = temp
            } else if (this.state.groupSel === '青壯') {
                temp = endsort.filter(e => e.role === '青壯')
                endsort = temp
            } else if (this.state.groupSel === '中壯') {
                temp = endsort.filter(e => e.role === '中壯')
                endsort = temp
            } else if (this.state.groupSel === '年長') {
                temp = endsort.filter(e => e.role === '年長')
                endsort = temp
            }
            this.setState({ endsort: endsort })
            /**給flatList顯示用，螢幕上最終處理好的資料 */
            let sort = endsort
            /**flatlist排序依據，預設主>家>排 */
            let priority = this.state.priority
            /**聚會頻率2-3次的flatlist索引標籤 */
            let id3 = ''
            /**聚會頻率1次的flatlist索引標籤 */
            let id1 = ''
            /**聚會頻率僅召會生活的flatlist索引標籤 */
            let idNon = ''
            if (priority === '主>家>排' || priority === '主>排>家') {
                id3 = sort.filter(e => e.sumL <= 3.0)[0]['member_id']
                id3 = sort.findIndex(e => e.member_id === id3)
                id1 = sort.filter(e => e.sumL <= 0.9)[0]['member_id']
                id1 = sort.findIndex(e => e.member_id === id1)
                idNon = sort.filter(e => e.sumL === '0.0')[0]['member_id']
                idNon = sort.findIndex(e => e.member_id === idNon)
                console.log("onPriority", id3, id1, idNon)
            } else if (priority === '家>主>排' || priority === '家>排>主') {
                id3 = sort.filter(e => e.sumH <= 3.0)[0]['member_id']
                id3 = sort.findIndex(e => e.member_id === id3)
                id1 = sort.filter(e => e.sumH <= 0.9)[0]['member_id']
                id1 = sort.findIndex(e => e.member_id === id1)
                idNon = sort.filter(e => e.sumH === '0.0')[0]['member_id']
                idNon = sort.findIndex(e => e.member_id === idNon)
            } else if (priority === '排>主>家' || priority === '排>家>主') {
                id3 = sort.filter(e => e.sumG <= 3.0)[0]['member_id']
                id3 = sort.findIndex(e => e.member_id === id3)
                id1 = sort.filter(e => e.sumG <= 0.9)[0]['member_id']
                id1 = sort.findIndex(e => e.member_id === id1)
                idNon = sort.filter(e => e.sumG === '0.0')[0]['member_id']
                idNon = sort.findIndex(e => e.member_id === idNon)
            }
            this.setState({ indexThree: id3, indexOne: id1, indexNon: idNon })
        }
    }
    /**
     * 分享
     */
    onShare = async () => {
        try {
            /**聚會頻率，預設是4-5次每月 */
            let freq = this.state.lordFreq
            /**給flatList顯示用，螢幕上最終處理好的資料，經過處理做成分享內容 */
            let msg = this.state.endsort
            let freqMsg = this.state.lordFreqSh
            let priority = this.state.priority
            let priMsg = ''
            const { shareYearf, shareYearT, shareMonthf, shareMonthT } = this.state
            if (freq === 4) {
                msg = msg.slice(0, (parseInt(this.state.indexThree) - 1))
            } else if (freq === 3) {
                msg = msg.slice(this.state.indexThree, (parseInt(this.state.indexOne) - 1))
            } else if (freq === 2) {
                msg = msg.slice(this.state.indexOne, (parseInt(this.state.indexNon) - 1))
            } else if (freq === 1) {
                let temp = msg.filter(e => e.sumG === '0.0')
                temp = temp.filter(e => e.sumH === '0.0')
                temp = temp.filter(e => e.sumL === '0.0')[0]['member_id']
                let index = sort.findIndex(e => e.member_id === temp)
                msg = msg.slice(this.state.indexNon, index - 1)
            }
            if (priority === '主>家>排' || priority === '主>排>家') {
                priMsg = '主日聚會'
            } else if (priority === '家>排>主' || priority === '家>主>排') {
                priMsg = '家聚會'
            } else if (priority === '排>主>家' || priority === '排>家>主') {
                priMsg = '小排聚會'
            }
            let msgg = []
            msg.map((value, index) => {
                msgg = msgg + '\n' + msg[index]['member_name']
            })
            const result = await Share.share({
                message: `這是從${shareYearf}年${shareMonthf}月到${shareYearT}年${shareMonthT}月${priMsg}頻率為${freqMsg}的名單:${msgg}`,
            })
        } catch (e) { console.log("onShare", e) }
    }
    /**
     * 使用setNativeProps使setState不會一直被重複呼叫，減少render的次數
     * @param {number} value 搜尋姓名的input value
     */
    searchInput = (value) => {
        _searchValue.setNativeProps({ text: value })
    }
    render() {
        /**toltalAttend, sumAttend都跑完了是false */
        const AttFetch = this.props.tolAtt.isFetching || this.props.sumAtt.isFetching
        console.log("AttFetch", AttFetch)
        return (
            <View style={[styles.container, this.props.themeData.MthemeB]}>
                <View style={styles.titleCard}>
                    <TextInput
                        autoCapitalize='none' placeholderTextColor={this.props.themeData.Stheme}
                        placeholder={this.props.lanData.search} maxLength={20} blurOnSubmit={true}
                        onBlur={() => this.filterArray()}
                        ref={component => (_searchValue = component)}
                        onSubmitEditing={(event) => this.setState({ searchData: event.nativeEvent.text })}
                        textAlignVertical="center"
                        style={[
                            this.props.themeData.MthemeB, this.props.ftszData.paragraph,
                            this.props.themeData.SthemeBo, this.props.themeData.XLtheme, styles.textInput
                        ]}
                    />
                    <IconButton icon="share-variant" size={25} color={this.props.themeData.SthemeC}
                        onPress={() => this.onShare()} style={{ elevation: 15 }}
                    />
                    <IconButton icon="tune-vertical" size={25} color={this.props.themeData.SthemeC}
                        onPress={() => this.setState({ alotsOp: true })} style={{ elevation: 15 }}
                    />
                    <IconButton icon="account-group" size={25} color={this.props.themeData.SthemeC}
                        onPress={() => this.DistrictRender()} style={{ elevation: 15 }}
                    />
                </View>
                <View style={styles.pickerView}>
                    <Button
                        mode="contained" icon="menu-down"
                        labelStyle={[this.props.ftszData.paragraph, this.props.themeData.Ltheme]}
                        style={[this.props.themeData.SthemeB, { borderRadius: 18, elevation: 12, marginHorizontal: 5 }]}
                        onPress={() => this.setState({ modeOp: true })}
                    >{this.state.lordFreqSh}</Button>
                    <Button
                        mode="contained" icon="menu-down"
                        labelStyle={[this.props.ftszData.paragraph, this.props.themeData.Ltheme]}
                        style={[this.props.themeData.SthemeB, { borderRadius: 18, elevation: 12, marginHorizontal: 5 }]}
                        onPress={() => this.setState({ priorityOp: true })}
                    >{this.state.prioritySh}</Button>
                </View>
                {AttFetch ?
                    <View style={[styles.actInd, this.props.themeData.MthemeB]}>
                        <ActivityIndicator animating={true} color="gray" size='large' />
                    </View> :
                    <View style={[this.props.themeData.MthemeB, { flex: 1, width: "92%", justifyContent: 'center' }]}>
                        <List.Item
                            title={this.props.lanData.description}
                            descriptionNumberOfLines={1}
                            titleStyle={[this.props.themeData.XLtheme, this.props.ftszData.paragraph]}
                            descriptionStyle={[this.props.themeData.Stheme, this.props.ftszData.paragraph]}
                            description={this.props.lanData.dataDescription}
                            onLayout={obj => { let hei = obj.nativeEvent.layout.height; this.setState({ flatListHeigh: hei }) }}
                        />
                        <FlatList
                            ref={(ref) => this.myScroll = ref}
                            data={(this.state.endsort).slice(0, 500)}
                            removeClippedSubviews={true}//default false
                            maxToRenderPerBatch={15}//default 10
                            updateCellsBatchingPeriod={120}//default 50 misec
                            initialNumToRender={8}//default 10
                            windowSize={15}//default 21
                            extraData={this.state.flatListRender}
                            keyExtractor={(item, key) => key}
                            getItemLayout={(data, index) => { return { length: this.state.flatListHeigh, index, offset: this.state.flatListHeigh * index } }}
                            renderItem={({ item }) => (
                                <List.Item
                                    title={item.member_name}
                                    descriptionNumberOfLines={1}
                                    titleStyle={[this.props.themeData.XLtheme, this.props.ftszData.paragraph]}
                                    descriptionStyle={[this.props.themeData.Stheme, this.props.ftszData.paragraph]}
                                    description={
                                        `主:${item.sumL}/月 家:${item.sumH}/月 排:${item.sumG}/月`
                                    }
                                />
                            )}
                        />
                    </View>}
                <Portal>
                    <Dialog
                        visible={this.state.modeOp}
                        style={this.props.themeData.LthemeB}
                        onDismiss={() => this.setState({ modeOp: false })}>
                        <Dialog.ScrollArea>
                            <ScrollView contentContainerStyle={{ paddingTop: 24 }}>
                                <Dialog.Content>
                                    <Text style={[this.props.ftszData.paragraph, this.props.themeData.Stheme]}>
                                        {this.props.lanData.lordTfreq}</Text>
                                    <View style={styles.selectGroup}>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.lordFreq === 4 ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            onPress={() =>
                                                this.setState({
                                                    lordFreq: 4,
                                                    lordFreqSh: this.props.lanData.fourperm
                                                })}
                                        >{this.props.lanData.fourperm}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.lordFreq === 3 ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            onPress={() =>
                                                this.setState({
                                                    lordFreq: 3,
                                                    lordFreqSh: this.props.lanData.threeperm
                                                })}
                                        >{this.props.lanData.threeperm}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.lordFreq === 2 ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            onPress={() =>
                                                this.setState({
                                                    lordFreq: 2,
                                                    lordFreqSh: this.props.lanData.oneperm
                                                })}
                                        >{this.props.lanData.oneperm}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.lordFreq === 1 ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            onPress={() =>
                                                this.setState({
                                                    lordFreq: 1,
                                                    lordFreqSh: this.props.lanData.otherChLf
                                                })}
                                        >{this.props.lanData.otherChLf}</Button>
                                    </View>
                                </Dialog.Content>
                            </ScrollView>
                        </Dialog.ScrollArea>
                        <Dialog.Actions>
                            <Button
                                labelStyle={[this.props.ftszData.paragraph, this.props.themeData.XLtheme]}
                                onPress={() => this.onFrequency()}
                            >OK</Button>
                        </Dialog.Actions>
                    </Dialog>
                    <Dialog
                        visible={this.state.alotsOp}
                        style={this.props.themeData.LthemeB}
                        onDismiss={() => this.setState({ alotsOp: false })}>
                        <Dialog.ScrollArea>
                            <ScrollView contentContainerStyle={{ paddingTop: 24 }}>
                                <Dialog.Content>
                                    <Text style={[this.props.ftszData.paragraph, this.props.themeData.Stheme]}>
                                        {this.props.lanData.gender}</Text>
                                    <View style={styles.selectGroup}>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.genderSel === '' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="all-inclusive"
                                            onPress={() => this.setState({ genderSel: '' })}
                                        >{this.props.lanData.all}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.genderSel === 'm' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="human-male"
                                            onPress={() => this.setState({ genderSel: 'm' })}
                                        >{this.props.lanData.male}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.genderSel === 'f' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="human-female"
                                            onPress={() => this.setState({ genderSel: 'f' })}
                                        >{this.props.lanData.female}</Button>
                                    </View>
                                    <Text style={[this.props.ftszData.paragraph, this.props.themeData.Stheme]}>
                                        {this.props.lanData.status}</Text>
                                    <View style={styles.selectGroup}>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.statusSel === '' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="all-inclusive"
                                            onPress={() => this.setState({ statusSel: '' })}
                                        >{this.props.lanData.all}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.statusSel === 'enable' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="check"
                                            onPress={() => this.setState({ statusSel: 'enable' })}
                                        >{this.props.lanData.enable}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.statusSel === 'disable' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="cancel"
                                            onPress={() => this.setState({ statusSel: 'disable' })}
                                        >{this.props.lanData.disable}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.statusSel === 'visit' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="train"
                                            onPress={() => this.setState({ statusSel: 'visit' })}
                                        >{this.props.lanData.visit}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.statusSel === 'moved' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="home-minus"
                                            onPress={() => this.setState({ statusSel: 'moved' })}
                                        >{this.props.lanData.moved}</Button>
                                    </View>
                                    <Text style={[this.props.ftszData.paragraph, this.props.themeData.Stheme]}>
                                        {this.props.lanData.identity}</Text>
                                    <View style={styles.selectGroup}>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.identitySel === '' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="all-inclusive"
                                            onPress={() => this.setState({ identitySel: '' })}
                                        >{this.props.lanData.all}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.identitySel === 's' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="sheep"
                                            onPress={() => this.setState({ identitySel: 's' })}
                                        >{this.props.lanData.saint}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.identitySel === 'g' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="sheep"
                                            onPress={() => this.setState({ identitySel: 'g' })}
                                        >{this.props.lanData.gospelFriend}</Button>
                                    </View>
                                    <Text style={[this.props.ftszData.paragraph, this.props.themeData.Stheme]}>
                                        {this.props.lanData.group}</Text>
                                    <View style={styles.selectGroup}>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.groupSel === '' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="all-inclusive"
                                            onPress={() => this.setState({ groupSel: '' })}
                                        >{this.props.lanData.all}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.groupSel === '學齡前' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="baby-carriage"
                                            onPress={() => this.setState({ groupSel: '學齡前' })}
                                        >{this.props.lanData.beforeSchool}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.groupSel === '小學' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="human-child"
                                            onPress={() => this.setState({ groupSel: '小學' })}
                                        >{this.props.lanData.primarySchool}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.groupSel === '中學' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="human-child"
                                            onPress={() => this.setState({ groupSel: '中學' })}
                                        >{this.props.lanData.secondarySchool}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.groupSel === '大專' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="human-male"
                                            onPress={() => this.setState({ groupSel: '大專' })}
                                        >{this.props.lanData.teritiarySchool}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.groupSel === '青職' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="human-handsdown"
                                            onPress={() => this.setState({ groupSel: '青職' })}
                                        >{this.props.lanData.working}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.groupSel === '青壯' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="human"
                                            onPress={() => this.setState({ groupSel: '青壯' })}
                                        >{this.props.lanData.mature}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.groupSel === '中壯' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="human-handsup"
                                            onPress={() => this.setState({ groupSel: '中壯' })}
                                        >{this.props.lanData.middleAge}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.groupSel === '年長' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="human-handsup"
                                            onPress={() => this.setState({ groupSel: '年長' })}
                                        >{this.props.lanData.elder}</Button>
                                    </View>
                                </Dialog.Content>
                            </ScrollView>
                        </Dialog.ScrollArea>
                        <Dialog.Actions>
                            <Button
                                labelStyle={[this.props.ftszData.paragraph, this.props.themeData.XLtheme]}
                                onPress={() => this.filterArray()}
                            >OK</Button>
                        </Dialog.Actions>
                    </Dialog>
                    <Dialog
                        visible={this.state.districtOp}
                        style={this.props.themeData.LthemeB}
                        onDismiss={() => this.setState({ districtOp: false })}>
                        <Dialog.ScrollArea>
                            <ScrollView contentContainerStyle={{ paddingTop: 24 }}>
                                <Dialog.Content>
                                    <View style={styles.selectGroup}>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.level2 === '' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="all-inclusive"
                                            onPress={() => this.setState({ level2: '', level2id: 0 })}
                                        >{this.props.lanData.all}</Button>
                                        {this.props.level2.map((item) => (
                                            <Button style={[{ margin: 5, borderRadius: 18 },
                                            this.state.level2 === item.data ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                                labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                                onPress={() => {
                                                    this.setState({ level2: item.data, level2id: item.attr.id }, () => {
                                                        this.DistrictRender2();
                                                    })
                                                }}
                                            >{item.data}</Button>
                                        ))}
                                    </View>
                                    <Divider />
                                    <View style={styles.selectGroup}>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.level3 === '' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="all-inclusive"
                                            onPress={() => this.setState({ level3: '', level3id: 0 })}
                                        >{this.props.lanData.all}</Button>
                                        {this.props.level3.map((item) => (
                                            <Button style={[{ margin: 5, borderRadius: 18 },
                                            this.state.level3 === item.data ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                                labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                                onPress={() => {
                                                    this.setState({ level3: item.data, level3id: item.attr.id }, () => {
                                                        this.DistrictRender3();
                                                    })
                                                }}
                                            >{item.data}</Button>
                                        ))}
                                    </View>
                                    <Divider />
                                    <View style={styles.selectGroup}>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.level4 === '' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            icon="all-inclusive"
                                            onPress={() => this.setState({ level4: '', level4id: 0 })}
                                        >{this.props.lanData.all}</Button>
                                        {this.props.level4.map((item) => (
                                            <Button style={[{ margin: 5, borderRadius: 18 },
                                            this.state.level4 === item.data ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                                labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                                onPress={() => {
                                                    this.setState({ level4: item.data, level4id: item.attr.id })
                                                }}
                                            >{item.data}</Button>
                                        ))}
                                    </View>
                                    <Divider />
                                </Dialog.Content>
                            </ScrollView>
                        </Dialog.ScrollArea>
                        <Dialog.Actions>
                            <Button
                                labelStyle={[this.props.ftszData.paragraph, this.props.themeData.XLtheme]}
                                onPress={() => this.filterArray()}
                            >OK</Button>
                        </Dialog.Actions>
                    </Dialog>
                    <Dialog
                        visible={this.state.priorityOp}
                        style={this.props.themeData.LthemeB}
                        onDismiss={() => this.setState({ priorityOp: false })}>
                        <Dialog.ScrollArea>
                            <ScrollView contentContainerStyle={{ paddingTop: 24 }}>
                                <Dialog.Content>
                                    <Text style={[this.props.ftszData.paragraph, this.props.themeData.Stheme]}>
                                        {this.props.lanData.priority}</Text>
                                    <View style={styles.selectGroup}>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.priority === '主>家>排' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            onPress={() =>
                                                this.setState({
                                                    priority: '主>家>排', prioritySh: this.props.lanData.LoHoGr
                                                })}
                                        >{this.props.lanData.LoHoGr}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.priority === '主>排>家' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            onPress={() =>
                                                this.setState({
                                                    priority: '主>排>家', prioritySh: this.props.lanData.LoGrHo
                                                })}
                                        >{this.props.lanData.LoGrHo}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.priority === '家>主>排' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            onPress={() =>
                                                this.setState({
                                                    priority: '家>主>排', prioritySh: this.props.lanData.HoLoGr
                                                })}
                                        >{this.props.lanData.HoLoGr}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.priority === '家>排>主' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            onPress={() =>
                                                this.setState({
                                                    priority: '家>排>主', prioritySh: this.props.lanData.HoGrLo
                                                })}
                                        >{this.props.lanData.HoGrLo}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.priority === '排>主>家' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            onPress={() =>
                                                this.setState({
                                                    priority: '排>主>家', prioritySh: this.props.lanData.GrLoHo
                                                })}
                                        >{this.props.lanData.GrLoHo}</Button>
                                        <Button style={[{ margin: 5, borderRadius: 18 },
                                        this.state.priority === '排>家>主' ? this.props.themeData.XLthemeB : this.props.themeData.SthemeB]}
                                            labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                                            onPress={() =>
                                                this.setState({
                                                    priority: '排>家>主', prioritySh: this.props.lanData.GrHoLo
                                                })}
                                        >{this.props.lanData.GrHoLo}</Button>
                                    </View>
                                </Dialog.Content>
                            </ScrollView>
                        </Dialog.ScrollArea>
                        <Dialog.Actions>
                            <Button
                                labelStyle={[this.props.ftszData.paragraph, this.props.themeData.XLtheme]}
                                onPress={() => this.onPriority()}
                            >OK</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        )
    }
}

function mapStateToProps(state) {
    //console.log("mapstate", state.tolAttReducer)
    return {
        lanData: state.languageReducer.lanData,
        ftszData: state.fontsizeReducer.ftszData,
        themeData: state.themeReducer.themeData,
        level2: state.level2Reducer.todos,
        level3: state.level3Reducer.todos,
        level4: state.level4Reducer.todos,
        tolAtt: state.tolAttReducer,
        sumAtt: state.sumAttReducer,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            toggleLanguage, toogleFontsize, toogleTheme,
            districtLevel2, districtLevel3, districtLevel4,
            totalAttend, sumAttend,
        }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(VisitScreen)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    titleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        width: "90%",
        marginTop: 25,
        paddingHorizontal: 4,
    },
    selectGroup: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    pickerView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
    },
    actInd: {
        height: "90%",
        alignItems: 'center',
        justifyContent: 'center',
    },
    textInput: {
        paddingLeft: 5,
        borderRadius: 18,
        borderWidth: 2,
        elevation: 12,
        marginVertical: 8,
        paddingVertical: 3,
        paddingLeft: 20,
        marginRight: 10,
        width: "60%",
    },
})