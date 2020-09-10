import React, { Component } from 'react'
import { View, StyleSheet, Alert, TextInput, ScrollView, AsyncStorage, FlatList } from 'react-native'
import {
    ActivityIndicator, Button, IconButton,
    Dialog, Text, Divider, Portal, List, FAB
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
import { refreshProp } from '../Actions/refreshProp'

// others
import { Actions } from 'react-native-router-flux' // pages navigation
import moment from 'moment' // time
/**
 * 
 * @class EditFreqScreen 編輯常用名單
 * @extends {Component}
 */
class EditFrqLstScreen extends Component {
    state = {
        /**搜尋聖徒姓名 */
        searchData: '',
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
        /**常用名單 */
        freqList: [],
        /**常用名單的名稱 */
        freqListName: '',
        /**開關最後確認常用名單的dialog */
        freqCheckOp: false,
        /**開關提醒忘記輸入常用名單名稱的dialog */
        freqListNameOp: false,
        /**數字變動時，flatList刷新 */
        flatListRender: 0,
        /**名單長度，判斷是否可以全選 */
        limit: 0,
        /**是否全選 */
        isAllSelect: false,
    }
    async componentDidMount() {
        try {
            /**所選擇的常用名單index */
            const k = await AsyncStorage.getItem('freqListKey')
            /**所選擇的常用名單內容 */
            let a = await AsyncStorage.getItem('frequList')
            /**轉成object的AsyncStorage裡面的常用名單 */
            let b = JSON.parse(a)[k]
            this.setState({
                orderAcord: b.orderAcord,
                showOrderAcord: b.orderAcord === '40' ? this.props.lanData.prayerFull
                    : b.orderAcord === '38' ? this.props.lanData.homeMetFull
                        : b.orderAcord === '39' ? this.props.lanData.grouMetFull
                            : b.orderAcord === '1473' ? this.props.lanData.gospVisFull
                                : b.orderAcord === '37' ? this.props.lanData.lordTableFull : '',
                freqList: b.member,
                freqListName: b.name
            })
            await this.getTotalAtt(), this.orderCal()
        } catch (e) { console.log("EditFrqLstScreen mount error", e) }
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
        const year = moment(new Date()).format("yyyy")
        const week = moment(new Date()).format("ww")
        const month = moment(new Date()).format("MM")
        await this.props.totalAttend(year, week, '0', '1', this.state.genderSel, this.state.statusSel,
            this.state.identitySel, this.state.groupSel, this.state.searchData)
        const totalFetch = await this.props.tolAtt.isFetching
        if (totalFetch === false) {
            let limit = await this.props.tolAtt.todos.count
            this.setState({ limit: parseInt(limit) })
            console.log("addFreq limit", limit)
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
            item.forEach((obj, index) => {
                toltmp.push({
                    member_name: obj['member_name'],
                    member_id: obj['member_id'],
                    path: obj['path'],
                    church_name: obj['church_name'],
                    sex: obj['sex'],
                    sum: tmpp[index],
                    freq: 0,
                })
            })
        }
        toltmp.sort((a, b) => { return b.sum - a.sum })//照sum降冪排序
        this.setState({ endsort: toltmp })
        //console.log("getTodalAtt", toltmp)
        console.log("getTotalAtt size", (JSON.stringify(toltmp).length) / 1024, "Kbyte")
        this.setState(prevState => ({ flatListRender: prevState.flatListRender + 1 }))
        if (this.state.freqList) {
            /**常用名單 */
            let frqLst = this.state.freqList
            frqLst.forEach((value, id) => {
                let indexSh = toltmp.map(m => m.member_id).indexOf(frqLst[id]['member_id'])
                toltmp[indexSh]['freq'] = 1
            })
            this.setState({ endsort: toltmp })
        }
    }
    /**
     * 照性別、狀態、身分、群組、搜尋、排區架構篩選 
     * */
    arrayFilter = async () => {
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
     * 照聚會項目重新call聚會資料並排續
     */
    reOrder = async () => {
        await this.getTotalAtt()
        await this.orderCal()
        this.setState({ orderAcordOp: false })
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
     * 新增聖徒到常用名單
     * @param {string} name - 欲新增的聖徒名字
     * @param {string} id - 欲新增的聖徒id
     * @param {number} freq - 原本是否已經加到這個常用名單
     */
    newMember = (name, id, freq) => {
        if (freq === 0) {
            /**常用名單 */
            let newMember = this.state.freqList
            newMember.push({
                member_name: name,
                member_id: id
            })
            /**給flatList顯示用，螢幕上最終處理好的資料 */
            let insertFlag = this.state.endsort.slice(0, 250)
            /**新增的那個人在endsort上面的index */
            let index = insertFlag.map(m => m.member_id).indexOf(id)
            insertFlag[index]['freq'] = 1
            this.setState({ freqList: newMember, endsort: insertFlag })
            //console.log("newMember", this.state.freqList, this.state.endsort[index])
        } else if (freq === 1) {
            /**常用名單 */
            let remMember = this.state.freqList
            /**移除的那個人在常用名單上面的index */
            let fIndex = remMember.map(e => e.member_id).indexOf(id)
            let remove = remMember.splice(fIndex, 1)
            /**給flatList顯示用，螢幕上最終處理好的資料 */
            let remFlag = this.state.endsort.slice(0, 250)
            /**移除的那個人在endsort上面的index */
            let index = remFlag.map(m => m.member_id).indexOf(id)
            remFlag[index]['freq'] = 0
            this.setState({ freqList: remMember, endsort: remFlag })
            //console.log("remove newMemeber", this.state.endsort[index])
        }
    }
    /**
     * 最後確認常用名單
     */
    finalCheck = async () => {
        if (this.state.freqListName === '') {
            const title = this.props.lanData.listName
            return (
                Alert.alert(
                    title, title,
                    [{ text: 'OK'/*, onPress: () => console.log('OK Pressed')*/ },]
                )
            )
        } else {
            this.setState({ freqCheckOp: false })
            /**常用名單 */
            let a = this.state.freqList
            /**將常用名單接上名稱和聚會項目 */
            let b = []
            b.push({ name: this.state.freqListName, orderAcord: this.state.orderAcord, member: a })
            try {
                /**在AsyncStorage上面的常用名單 */
                let c = await AsyncStorage.getItem('frequList')
                const k = await AsyncStorage.getItem('freqListKey')
                /**AsyncStorage上面的常用名單的object */
                let d = []
                d = JSON.parse(c)
                let remove = d.splice(k, 1)
                console.log("editFrqLst", d)
                /**剛剛選好的名單加回去常用名單 */
                let e = []
                d.forEach(obj => {
                    e.push({
                        member: obj.member, name: obj.name, orderAcord: obj.orderAcord
                    }, { name: this.state.freqListName, orderAcord: this.state.orderAcord, member: a })
                })
                await AsyncStorage.setItem('frequList', JSON.stringify(e))
                /**flag每有變動，有在監控prevProps.refreshFlag的頁面會刷新 */
                let flag = await this.props.refreshFlag.flag
                flag = flag + 1
                this.props.refreshProp(flag)
            } catch (e) { console.log("finalCheck error", e) }
            Actions.pop()
        }
    }
    /**
     * 全選所有聖徒名單
     */
    selectAll = () => {
        if (this.state.isAllSelect === false) {
            /**名單長度，判斷是否可以全選 */
            const limit = this.state.limit
            if (limit > 499) {
                const title = this.props.lanData.tooManyTi
                const msg = this.props.lanData.tooManyMsg
                return (
                    Alert.alert(
                        title, msg,
                        [{ text: 'OK'/*, onPress: () => console.log('OK Pressed')*/ },]
                    )
                )
            } else {
                /**製作成全選的名單 */
                let newMember = []
                /**給flatList顯示用，螢幕上最終處理好的資料 */
                let obj = this.state.endsort
                obj.forEach(objj => {
                    newMember.push({
                        member_name: objj.member_name,
                        member_id: objj.member_id
                    })
                })
                obj.forEach((value, index) => { obj[index]['freq'] = 1 })
                this.setState({ freqList: newMember, endsort: obj, isAllSelect: true })
            }
        } else {
            /**給flatList顯示用，螢幕上最終處理好的資料 */
            let reMember = this.state.endsort
            reMember.forEach((value, index) => { reMember[index]['freq'] = 0 })
            this.setState({ freqList: [], endsort: reMember, isAllSelect: false })
        }
    }
    render() {
        const AttFetch = this.props.tolAtt.isFetching || this.props.sumAtt.isFetching
        return (
            <View style={[styles.container, this.props.themeData.MthemeB]}>
                <View style={styles.searchCard}>
                    <TextInput
                        autoCapitalize='none' placeholderTextColor={this.props.themeData.Stheme}
                        placeholder={this.props.lanData.search} maxLength={20} blurOnSubmit={true}
                        onChangeText={text => this.setState({ searchData: text })}
                        onBlur={() => this.arrayFilter()}
                        value={this.state.searchData} textAlignVertical="center"
                        style={[
                            this.props.themeData.MthemeB, this.props.ftszData.paragraph,
                            this.props.themeData.SthemeBo, this.props.themeData.XLtheme, styles.textInput
                        ]}
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
                        onPress={() => this.clearFilter()}
                    >{this.props.lanData.clearAll}</Button>
                    <Button
                        mode="outlined"
                        labelStyle={[this.props.ftszData.paragraph, this.props.themeData.Ltheme]}
                        style={[this.props.themeData.SthemeB, { borderRadius: 18, elevation: 12, marginHorizontal: 5 }]}
                        onPress={() => this.selectAll()}
                    >{this.props.lanData.selectAll}</Button>
                </View>
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
                                    right={props => <List.Icon {...props} icon={
                                        item.freq === 1 ? "check" : ""
                                    } color={this.props.themeData.SthemeC} style={this.props.ftszData.paragraph} />}
                                    onPress={() => this.newMember(item.member_name, item.member_id, item.freq)}
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
                        onDismiss={() => this.setState({ orderAcordOp: false })}>
                        <Dialog.ScrollArea>
                            <ScrollView contentContainerStyle={{ paddingTop: 24 }}>
                                <Text style={[this.props.ftszData.paragraph, this.props.themeData.Stheme]}>
                                    {this.props.lanData.orderAccord}</Text>
                                <List.Item
                                    title={this.props.lanData.lordTableFull}
                                    titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                                    onPress={() => {
                                        this.setState({
                                            orderAcord: '37',
                                            showOrderAcord: this.props.lanData.lordTableFull
                                        })
                                    }} />
                                <List.Item
                                    title={this.props.lanData.prayerFull}
                                    titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                                    onPress={() => {
                                        this.setState({
                                            orderAcord: '40',
                                            showOrderAcord: this.props.lanData.prayerFull
                                        })
                                    }} />
                                <List.Item
                                    title={this.props.lanData.homeMetFull}
                                    titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                                    onPress={() => {
                                        this.setState({
                                            orderAcord: '38',
                                            showOrderAcord: this.props.lanData.homeMetFull
                                        })
                                    }} />
                                <List.Item
                                    title={this.props.lanData.grouMetFull}
                                    titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                                    onPress={() => {
                                        this.setState({
                                            orderAcord: '39',
                                            showOrderAcord: this.props.lanData.grouMetFull
                                        })
                                    }} />
                                <List.Item
                                    title={this.props.lanData.gospVisFull}
                                    titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                                    onPress={() => {
                                        this.setState({
                                            orderAcord: '1473',
                                            showOrderAcord: this.props.lanData.gospVisFull
                                        })
                                    }} />
                            </ScrollView>
                        </Dialog.ScrollArea>
                        <Dialog.Actions>
                            <Button
                                labelStyle={[this.props.ftszData.paragraph, this.props.themeData.XLtheme]}
                                onPress={() => this.reOrder()}
                            >OK</Button>
                        </Dialog.Actions>
                    </Dialog>
                    <Dialog
                        visible={this.state.freqCheckOp}
                        style={this.props.themeData.LthemeB}
                        onDismiss={() => this.setState({ freqCheckOp: false })}>
                        <Dialog.ScrollArea>
                            <ScrollView contentContainerStyle={{ paddingTop: 24 }}>
                                <View>
                                    <TextInput
                                        autoCapitalize='none' placeholderTextColor={this.props.themeData.Stheme}
                                        placeholder={this.props.lanData.listName} maxLength={20} blurOnSubmit={true}
                                        onChangeText={text => this.setState({ freqListName: text })}
                                        value={this.state.freqListName} textAlignVertical="center"
                                        style={[
                                            this.props.themeData.MthemeB, this.props.ftszData.paragraph,
                                            this.props.themeData.SthemeBo, this.props.themeData.XLtheme, styles.txInDialog
                                        ]}
                                    />
                                    {this.state.freqList.map((item) => (
                                        <List.Item
                                            title={item.member_name}
                                            titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                                        />
                                    ))}
                                </View>
                            </ScrollView>
                        </Dialog.ScrollArea>
                        <Dialog.Actions>
                            <Button
                                labelStyle={[this.props.ftszData.paragraph, this.props.themeData.XLtheme]}
                                onPress={() => this.finalCheck()}
                            >OK</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
                <FAB style={styles.fab} icon="check" small
                    label={this.props.lanData.ListConfirm}
                    onPress={() => this.setState({ freqCheckOp: true })} />
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
        refreshFlag: state.refreshReducer
    }
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            toggleLanguage, toogleFontsize, toogleTheme,
            districtLevel2, districtLevel3, districtLevel4,
            totalAttend, sumAttend,
            refreshProp,
        }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditFrqLstScreen)

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
    pickerView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
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
    txInDialog: {
        paddingLeft: 5,
        borderRadius: 18,
        borderWidth: 1,
        marginVertical: 8,
        paddingVertical: 3,
        paddingLeft: 20,
        marginRight: 10,
        width: "80%",
    },
    selectGroup: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    actInd: {
        height: "90%",
        alignItems: 'center',
        justifyContent: 'center',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
})