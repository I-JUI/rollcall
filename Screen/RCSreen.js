import React, { Component } from 'react'
import { View, StyleSheet, Alert, TextInput, ScrollView, AsyncStorage, FlatList } from 'react-native'
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
import { rollCall } from '../Actions/rollCall'

// others
import DateTimePicker from '@react-native-community/datetimepicker';// default calender picker
import { Actions } from 'react-native-router-flux' // pages navigation
import moment from 'moment' // time
/**
 * 
 * @class RCScreen 點名頁面
 * @extends {Component}
 */
class RCScreen extends Component {
    state = {
        /**搜尋聖徒姓名 */
        searchData: '',
        /**週次，initial現在 */
        nowDate: moment(new Date()).format("ww"),
        /**年，initial現在 */
        nowYear: moment(new Date()).format("yyyy"),
        /**月，initial現在 */
        nowMonth: moment(new Date()).format("MM"),
        /**開關日曆 */
        showCalender: false,
        /**日曆顯示的值，initail今天 */
        CalenderValue: new Date(),
        /**開關snackbar，提醒選擇的週次日期 */
        showSnackbar: false,
        /**搭配snackbar，顯示週次起始日期 */
        dateStart: moment(new Date()).day("Monday").format("YYYY/MM/DD"),
        /**搭配snackbar，顯示週次結束日期 */
        dateEnd: moment(new Date()).day("Monday").day(7).format("YYYY/MM/DD"),
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
        /**聚會項目代號，37主日，40禱告，38家聚，39小排，1473福音 */
        orderAcord: '37',
        /**聚會項目名稱 */
        showOrderAcord: this.props.lanData.lordTableFull,
        /**開關dialog，聚會選項 */
        orderAcordOp: false,
        /**給flatList顯示用，螢幕上最終處理好的資料 */
        endsort: [],
        /**數字變動時，flatList刷新 */
        flatListRender: 0,
    }
    async componentDidMount() {
        const hh = moment(new Date()).diff(moment().startOf('week'), 'h')
        if (hh > 176) {
            this.setState({ orderAcord: '37', showOrderAcord: this.props.lanData.lordTableFull })
        } else if (hh > 89) {
            this.setState({ orderAcord: '39', showOrderAcord: this.props.lanData.grouMetFull })
        } else if (hh > 65) {
            this.setState({ orderAcord: '40', showOrderAcord: this.props.lanData.prayerFull })
        }
        await this.getTotalAtt(), await this.orderCal()
    }
    /**
     * 日曆選完確定之後重設日期，資料內容重刷成該週資料
     * @param {object} event - 有東西的時候表示日曆日期有動過，DateTimePicker自動生成
     * @param {string} date - 用moment可轉成日期格式，DateTimePicker自動生成
     */
    CalonChange = async (event, date) => {
        this.setState({
            CalenderValue: date,
            dateStart: moment(date).day("Monday").format("YYYY/MM/DD"),
            dateEnd: moment(date).day("Monday").day(7).format("YYYY/MM/DD"),
            nowDate: moment(date).format("ww"),
            nowYear: moment(date).format("yyyy"),
            nowMonth: moment(date).format("MM"),
            showCalender: false,
            showSnackbar: true,
        })
        if (event !== null) {
            await this.getTotalAtt()
            if (this.state.genderSel !== '') {
                await this.arrayFilter()
            } else { await this.orderCal() }
        }
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
    getTotalAtt = async () => {
        const year = this.state.nowYear
        const week = this.state.nowDate
        const month = this.state.nowMonth
        await this.props.totalAttend(year, week, '0', '1', this.state.genderSel, this.state.statusSel,
            this.state.identitySel, this.state.groupSel, this.state.searchData)
        const totalFetch = await this.props.tolAtt.isFetching
        if (totalFetch === false) {
            let limit = await this.props.tolAtt.todos.count
            console.log("RCScreen limit", limit)
            await this.props.totalAttend(year, week, '0', limit, this.state.genderSel, this.state.statusSel,
                this.state.identitySel, this.state.groupSel, this.state.searchData)
            const year_from = month - 6 > 0 ? year : year - 1
            const month_from = month - 6 > 0 ? month - 6 : month + 6
            const year_to = month - 1 > 0 ? year : year - 1
            const month_to = month - 1 > 0 ? month - 1 : 11 + month
            await this.props.sumAttend(this.state.orderAcord, year_from, month_from, year_to, month_to,
                this.state.searchData, this.state.genderSel, this.state.statusSel, this.state.identitySel,
                this.state.groupSel, limit)
        }
    }
    /**
     * 從toltalAtt和sumAtt整合資料，合併、照聚會項目排序
     */
    orderCal = async () => {
        /**sumAtt抓資料結束時是false */
        const orderCalFetch = await this.props.sumAtt.isFetching
        /**接收每週聚會資料 */
        let tmp = []
        /**加總每週數據成 */
        let tmpp = []
        if (orderCalFetch === false) {
            const item = await this.props.sumAtt.todos.stats.rows
            item.forEach((objectss) => {
                tmp.push({
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
            tmpp = tmp.map(o => Object.keys(o).reduce((t, p) => t + o[p], 0));//加總每週數據
        }
        /**tolAtt抓資料結束時是false */
        const getTolFetch = await this.props.tolAtt.isFetching
        /**接收sumAtt和tolAtt合併資料並排序 */
        let toltmp = []
        if (getTolFetch === false) {
            const item = await this.props.tolAtt.todos.members
            const Acord = this.state.orderAcord
            let attend = 'attend0'
            Acord === '40' ? attend = 'attend1' :
                Acord === '38' ? attend = 'attend2' :
                    Acord === '39' ? attend = 'attend3' :
                        Acord === '1473' ? attend = 'attend5' : attend = 'attend0'
            item.forEach((obj, index) => {
                toltmp.push({
                    member_name: obj['member_name'],
                    member_id: obj['member_id'],
                    path: obj['path'],
                    church_name: obj['church_name'],
                    sex: obj['sex'],
                    sum: tmpp[index],
                    attend: obj[attend] === null ? 0 : 1,
                })
            })
        }
        toltmp.sort((a, b) => { return b.sum - a.sum })//照sum降冪排序
        this.setState({ endsort: toltmp })
        //console.log("getTodalAtt", toltmp)
        console.log("getTotalAtt size", (JSON.stringify(toltmp).length) / 1024, "Kbyte")
        this.setState(prevState => ({ flatListRender: prevState.flatListRender + 1 }))
    }
    /**
     * 照性別、狀態、身分、群組、搜尋、排區架構篩選 
     * */
    arrayFilter = async () => {
        console.log("searchData",this.state.searchData)
        if (this.state.statusSel || this.state.identitySel || this.state.groupSel) {
            this.setState({ alotsOp: false })
            await this.getTotalAtt()
            await this.orderCal()
            console.log("recalApi", this.state.groupSel)
        } else {
            this.setState({ districtOp: false, alotsOp: false })
            await this.orderCal()
            /**給flatList顯示用，螢幕上最終處理好的資料 */
            let obj = this.state.endsort
            /**性別 */
            const gender = this.state.genderSel
            /**搜尋聖徒姓名 */
            const search = this.state.searchData
            /**接收篩選後的資料，重複使用 */
            let temp = []
            /**判斷排區架構選到哪一層 */
            const ttmp = JSON.stringify(this.state.level2id + this.state.level3id + this.state.level4id).length
            if (this.state.level2id || this.state.level3id || this.state.level4id) {
                if (ttmp === 8) {
                    temp = obj.filter(e => e.path.split(',')[1] === this.state.level2id)
                    obj = temp
                } else if (ttmp === 11) {
                    temp = obj.filter(e => e.path.split(',')[2] === this.state.level3id)
                    obj = temp
                } else if (ttmp === 14) {
                    temp = obj.filter(e => e.path.split(',')[3] === this.state.level4id)
                    obj = temp
                }
            }
            if (search) {
                temp = obj.filter(e => e.member_name.includes(search))
                obj = temp
            }
            if (gender === 'f') {
                temp = obj.filter(e => e.sex === '女')
                obj = temp
            } else if (gender === 'm') {
                temp = obj.filter(e => e.sex === '男')
                obj = temp
            }
            this.setState({ endsort: obj })
        }
    }
    /**
     * 清除所有篩選項目回復到預設
     */
    clearFilter = () => {
        this.setState({
            searchData: '', genderSel: '', statusSel: '', identitySel: '', groupSel: '',
            level2id: 0, level3id: 0, level4id: 0
        }, async () => { await this.getTotalAtt(), await this.orderCal() })
    }
    /**
     * 點名
     * @param {string} id - 聖徒id 
     * @param {number} origAtt - 原本是有來1或沒來0
     */
    rollCall = async (id, origAtt) => {
        origAtt === 0 ?
            await this.props.rollCall(id, this.state.orderAcord, this.state.nowYear, this.state.nowDate, '1')
            : await this.props.rollCall(id, this.state.orderAcord, this.state.nowYear, this.state.nowDate, '0')
        /**給flatList顯示用，螢幕上最終處理好的資料 */
        let b = this.state.endsort.slice(0, 250)
        /**該聖徒在endsort上面所在的位置index */
        let index = b.map(member => member.member_id).indexOf(id)
        /**判斷點名聚會項目 */
        origAtt === 0 ? b[index]['attend'] = 1 : b[index]['attend'] = 0
        this.setState({ endsort: b })
        this.setState(prevState => ({ flatListRender: prevState.flatListRender + 1 }))
        console.log("changeState", this.state.endsort[index])
    }
    /**
     * 照聚會項目重新call聚會資料並排續
     */
    reOrder = async () => {
        await this.getTotalAtt()
        await this.orderCal()
        this.setState({ orderAcordOp: false })
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
                <View style={styles.searchCard}>
                    <TextInput
                        autoCapitalize='none' placeholderTextColor={this.props.themeData.Stheme}
                        placeholder={this.props.lanData.search} maxLength={20} blurOnSubmit={true}
                        ref={component => (_searchValue = component)}
                        onBlur={() => this.arrayFilter()}
                        onSubmitEditing={(event) => this.setState({ searchData: event.nativeEvent.text })}
                        textAlignVertical="center"
                        style={[
                            this.props.themeData.MthemeB, this.props.ftszData.paragraph,
                            this.props.themeData.SthemeBo, this.props.themeData.XLtheme, styles.textInput
                        ]}
                    />
                    <IconButton icon="calendar-search" size={25} color={this.props.themeData.SthemeC}
                        onPress={() => this.setState({ showCalender: true })} style={{ elevation: 15 }}
                    />
                    <IconButton icon="tune-vertical" size={25} color={this.props.themeData.SthemeC}
                        onPress={() => this.setState({ alotsOp: true })} style={{ elevation: 15 }}
                    />
                    <IconButton icon="account-group" size={25} color={this.props.themeData.SthemeC}
                        onPress={this.DistrictRender} style={{ elevation: 15 }}
                    />
                </View>
                <View style={styles.pickerView}>
                    <Button
                        mode="contained" icon="menu-down"
                        labelStyle={[this.props.ftszData.paragraph, this.props.themeData.Ltheme]}
                        style={[this.props.themeData.SthemeB, { borderRadius: 18, elevation: 12, marginHorizontal: 5 }]}
                        onPress={() => this.setState({ orderAcordOp: true })}
                    >{this.state.showOrderAcord}</Button>
                    <Button
                        mode="outlined"
                        labelStyle={[this.props.ftszData.paragraph, this.props.themeData.Ltheme]}
                        style={[this.props.themeData.SthemeB, { borderRadius: 18, elevation: 12, marginHorizontal: 5 }]}
                        onPress={() => { }}
                    >{this.props.lanData.addNew}</Button>
                    <Button
                        mode="outlined"
                        labelStyle={[this.props.ftszData.paragraph, this.props.themeData.Ltheme]}
                        style={[this.props.themeData.SthemeB, { borderRadius: 18, elevation: 12, marginHorizontal: 5 }]}
                        onPress={() => this.clearFilter()}
                    >{this.props.lanData.clearAll}</Button>
                </View>
                <Snackbar
                    visible={this.state.showSnackbar} duration={1500}
                    onDismiss={() => this.setState({ showSnackbar: false })}
                >{this.state.dateStart} ~ {this.state.dateEnd}
                </Snackbar>
                {this.state.showCalender && (
                    <DateTimePicker
                        mode="date" display="calendar"
                        value={this.state.CalenderValue}
                        onChange={this.CalonChange}
                    />
                )}
                {AttFetch ?
                    <View style={[styles.actInd, this.props.themeData.MthemeB]}>
                        <ActivityIndicator animating={true} color="gray" size='large' />
                    </View> :
                    <View style={[this.props.themeData.MthemeB, { flex: 1, width: "92%", justifyContent: 'center' }]}>
                        <FlatList
                            ref={(ref) => this.myScroll = ref}
                            data={(this.state.endsort).slice(0, 250)}
                            removeClippedSubviews={true}//default false
                            maxToRenderPerBatch={15}//default 10
                            updateCellsBatchingPeriod={120}//default 50 misec
                            initialNumToRender={8}//default 10
                            windowSize={15}//default 21
                            extraData={this.state.flatListRender}
                            keyExtractor={(item, key) => key}
                            renderItem={({ item }) => (
                                <List.Item
                                    title={item.member_name}
                                    titleStyle={[this.props.themeData.XLtheme, this.props.ftszData.paragraph]}
                                    descriptionStyle={[this.props.themeData.Stheme, this.props.ftszData.paragraph]}
                                    description={item.church_name}
                                    right={props =>
                                        <List.Icon {...props} icon={item.attend === 1 ? "check" : "close"}
                                            color={this.props.themeData.SthemeC} style={this.props.ftszData.paragraph} />
                                    }
                                    onPress={() => this.rollCall(item.member_id, item.attend)}
                                />
                            )}
                        />
                    </View>}
                <Portal>
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
                                onPress={() => this.arrayFilter()}
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
                                onPress={() => this.arrayFilter()}
                            >OK</Button>
                        </Dialog.Actions>
                    </Dialog>
                    <Dialog
                        visible={this.state.orderAcordOp}
                        style={this.props.themeData.LthemeB}
                        onDismiss={() => this.setState({ orderAcordOp: false })}
                    >
                        <List.Item
                            title={this.props.lanData.lordTableFull}
                            titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                            onPress={() => {
                                this.setState({
                                    orderAcord: '37',
                                    showOrderAcord: this.props.lanData.lordTableFull
                                })
                            }}
                        />
                        <List.Item
                            title={this.props.lanData.prayerFull}
                            titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                            onPress={() => {
                                this.setState({
                                    orderAcord: '40',
                                    showOrderAcord: this.props.lanData.prayerFull
                                })
                            }}
                        />
                        <List.Item
                            title={this.props.lanData.homeMetFull}
                            titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                            onPress={() => {
                                this.setState({
                                    orderAcord: '38',
                                    showOrderAcord: this.props.lanData.homeMetFull
                                })
                            }}
                        />
                        <List.Item
                            title={this.props.lanData.grouMetFull}
                            titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                            onPress={() => {
                                this.setState({
                                    orderAcord: '39',
                                    showOrderAcord: this.props.lanData.grouMetFull
                                })
                            }}
                        />
                        <List.Item
                            title={this.props.lanData.gospVisFull}
                            titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                            onPress={() => {
                                this.setState({
                                    orderAcord: '1473',
                                    showOrderAcord: this.props.lanData.gospVisFull
                                })
                            }}
                        />
                        <Dialog.Actions>
                            <Button
                                labelStyle={[this.props.ftszData.paragraph, this.props.themeData.XLtheme]}
                                onPress={() => this.reOrder()}
                            >OK</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
                <FAB style={styles.fab} icon="arrow-up" small
                    onPress={() => {
                        console.log("FAB")
                        this.myScroll.scrollToIndex({ animated: true, index: 0 })
                    }}
                />
            </View>
        )
    }
}

function mapStateToProps(state) {
    //console.log("mapstate", state.level2Reducer)
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
            totalAttend, sumAttend, rollCall
        }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RCScreen)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    searchCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        width: "90%",
        marginTop: 25,
        paddingHorizontal: 4,
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
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    actInd: {
        height: "90%",
        alignItems: 'center',
        justifyContent: 'center',
    },
})