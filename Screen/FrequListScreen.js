import React, { Component } from 'react'
import { View, StyleSheet, Alert, TextInput, ScrollView, AsyncStorage, FlatList } from 'react-native'
import {
    ActivityIndicator, Button, IconButton, List,
    Dialog, Text, Divider, Portal, FAB, Snackbar
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
import { refreshProp } from '../Actions/refreshProp'

// others
import DateTimePicker from '@react-native-community/datetimepicker';// default calender picker
import { Actions } from 'react-native-router-flux' // pages navigation
import moment from 'moment' // time
/**
 * 
 * @class FrequListScreen 常用名單點名
 * @extends {Component}
 */
class FrequListScreen extends Component {
    state = {
        /**常用名單 */
        freqList: [],
        /**給flatList顯示用，螢幕上最終處理好的資料 */
        endsort: [],
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
        /**聚會項目代號，37主日，40禱告，38家聚，39小排，1473福音 */
        orderAcord: '37',
        /**聚會項目名稱 */
        showOrderAcord: this.props.lanData.lordTableFull, orderAcordOp: false,
        /**是否全選 */
        isSelectAll: false,
        /**開關警告刪除常用名單的dialog */
        checkDeleteOp: false,
    }
    async componentDidMount() {
        await this.getStart()
        await this.getTotalAtt(), await this.orderAtt()
    }
    /**
     * prevProps.refreshFlag改變時，刷新頁面
     * @param {object} prevProps - 前一個props 
     */
    async componentDidUpdate(prevProps) {
        if (prevProps.refreshFlag !== this.props.refreshFlag) {
            //Actions.refresh({ key: this.props.refreshFlag })
            await this.getStart()
            await this.getTotalAtt()
            await this.orderAtt()
        }
    }
    /**
     * 從AsyncStorage找出指定的常用名單
     */
    getStart = async () => {
        try {
            /**在首頁選擇的常用名單key */
            const k = await AsyncStorage.getItem('freqListKey')
            /**AsyncStorage裡面所有的常用名單 */
            let a = await AsyncStorage.getItem('frequList')
            /**指定的常用名單轉object格式 */
            let b = JSON.parse(a)[k]
            this.setState({
                orderAcord: b.orderAcord,
                showOrderAcord: b.orderAcord === '40' ? this.props.lanData.prayerFull
                    : b.orderAcord === '38' ? this.props.lanData.homeMetFull
                        : b.orderAcord === '39' ? this.props.lanData.grouMetFull
                            : b.orderAcord === '1473' ? this.props.lanData.gospVisFull
                                : b.orderAcord === '37' ? this.props.lanData.lordTableFull : '',
                freqList: b.member
            })
        } catch (e) { console.log("componentDidMount", e) }
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
     * call toltalAttend api
     */
    getTotalAtt = async () => {
        const year = this.state.nowYear
        const week = this.state.nowDate
        let limit = await this.props.tolAtt.todos.count
        console.log("RCScreen limit", limit)
        await this.props.totalAttend(year, week, '0', limit, '', '',
            '', '', '')
    }
    /**
     * 從toltalAtt聚會資料合併到常用名單
     */
    orderAtt = async () => {
        /**tolAtt抓資料結束時是false */
        const getTolFetch = await this.props.tolAtt.isFetching
        /**常用名單 */
        let freqList = this.state.freqList
        /**合併常用名單聖徒的當週聚會資料 */
        let toltmp = []
        /**常用名單裡面的聖徒在tolAtt裡面的位置 */
        let keytmp = []
        if (getTolFetch === false) {
            /**tolAtt裡面聖徒聚會資料 */
            const item = await this.props.tolAtt.todos.members
            freqList.forEach((value, index) => {
                keytmp.push(
                    item.map(m => m.member_id).indexOf(value.member_id)
                )
            })
            const Acord = this.state.orderAcord
            let attend = 'attend0'
            Acord === '40' ? attend = 'attend1' :
                Acord === '38' ? attend = 'attend2' :
                    Acord === '39' ? attend = 'attend3' :
                        Acord === '1473' ? attend = 'attend5' : attend = 'attend0'
            freqList.forEach((value, index) => {
                toltmp.push({
                    member_name: value.member_name, member_id: value.member_id,
                    attend: item[keytmp[index]][attend] === null ? 0 : 1,
                })
            })
            console.log("orderAtt", toltmp)
            this.setState({ endsort: toltmp })
        }
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
        origAtt === 0 ? b[index]['attend'] = 1 : b[index]['attend'] = 0
        this.setState({ endsort: b })
        console.log("changeState", this.state.endsort[index])
    }
    /**
     * 全部常用名單一起點名
     */
    selectAll = async () => {
        /**給flatList顯示用，螢幕上最終處理好的資料 */
        let a = this.state.endsort
        /**常用名單上面所有人的聖徒id */
        let b = []
        a.forEach((value, index) => {
            b[index] = parseInt(a[index]['member_id'])
        })
        if (this.state.isSelectAll) {
            await this.props.rollCall(b, this.state.orderAcord, this.state.nowYear, this.state.nowDate, '0')
            a.forEach((value, index) => {
                a[index]['attend'] = 0
            })
            this.setState({ isSelectAll: false })
        } else {
            await this.props.rollCall(b, this.state.orderAcord, this.state.nowYear, this.state.nowDate, '1')
            a.forEach((value, index) => {
                a[index]['attend'] = 1
            })
            this.setState({ isSelectAll: true, endsort: a })
        }
    }
    /**
     * 聖徒姓名搜尋
     *  */
    arrayFilter = () => {
        let a = this.state.endsort
        const search = this.state.searchData
        let b = []
        if (search) {
            b = a.filter(e => e.member_name.includes(search))
            this.setState({ endsort: b })
        } else {
            this.orderAtt()
        }
    }
    /**
     * 刪除這個常用名單
     */
    deleteFrqLst = async () => {
        try {
            /**這個常用名單在全部常用名單中的位置 */
            const k = await AsyncStorage.getItem('freqListKey')
            /**AsyncStroage全部的常用名單 */
            let a = await AsyncStorage.getItem('frequList')
            /**全部常用名單的object格式 */
            let b = JSON.parse(a)
            let remove = b.splice(k, 1)
            await AsyncStorage.setItem('frequList', JSON.stringify(b))
            this.setState({ checkDeleteOp: false })
            /**刷新首頁的常用名單旗標 */
            let flag = await this.props.refreshFlag.flag
            flag = flag + 1
            this.props.refreshProp(flag)
            Actions.pop()
        } catch (e) { console.log("deleteFrqLst error", e) }
    }
    /**
     * 使用setNativeProps使setState不會一直被重複呼叫，減少render的次數
     * @param {number} value 搜尋姓名的input value
     */
    searchInput = (value) => {
        _searchValue.setNativeProps({ text: value })
    }
    render() {
        /**tolAtt抓資料結束時是false */
        const AttFetch = this.props.tolAtt.isFetching
        return (
            <View style={[styles.container, this.props.themeData.MthemeB]}>
                <View style={styles.searchCard}>
                    <TextInput
                        autoCapitalize='none' placeholderTextColor={this.props.themeData.Stheme}
                        placeholder={this.props.lanData.search} maxLength={20} blurOnSubmit={true}
                        ref={component => (_searchValue = component)}
                        onSubmitEditing={(event) => this.setState({ searchData: event.nativeEvent.text })}
                        onBlur={() => this.arrayFilter()}
                        textAlignVertical="center"
                        style={[
                            this.props.themeData.MthemeB, this.props.ftszData.paragraph,
                            this.props.themeData.SthemeBo, this.props.themeData.XLtheme, styles.textInput
                        ]}
                    />
                    <IconButton icon="calendar-search" size={25} color={this.props.themeData.SthemeC}
                        onPress={() => this.setState({ showCalender: true })} style={{ elevation: 15 }}
                    />
                    <IconButton icon="trash-can" size={25} color={this.props.themeData.SthemeC}
                        onPress={() => this.setState({ checkDeleteOp: true })} style={{ elevation: 15 }}
                    />
                    <IconButton icon="pen-plus" size={25} color={this.props.themeData.SthemeC}
                        onPress={() => Actions.EditFrqLstScreen()} style={{ elevation: 15 }}
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
                        onPress={() => this.selectAll()}
                    >{this.props.lanData.selectAll}</Button>
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
                                    right={props => <List.Icon {...props} icon={item.attend === 1 ? "check" : "close"}
                                        color={this.props.themeData.SthemeC} style={this.props.ftszData.paragraph} />}
                                    onPress={() => this.rollCall(item.member_id, item.attend)}
                                />
                            )}
                        />
                    </View>}
                <Portal>
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
                                            showOrderAcord: this.props.lanData.lordTableFull,
                                        })
                                    }} />
                                <List.Item
                                    title={this.props.lanData.prayerFull}
                                    titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                                    onPress={() => {
                                        this.setState({
                                            orderAcord: '40',
                                            showOrderAcord: this.props.lanData.prayerFull,
                                        })
                                    }} />
                                <List.Item
                                    title={this.props.lanData.homeMetFull}
                                    titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                                    onPress={() => {
                                        this.setState({
                                            orderAcord: '38',
                                            showOrderAcord: this.props.lanData.homeMetFull,
                                        })
                                    }} />
                                <List.Item
                                    title={this.props.lanData.grouMetFull}
                                    titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                                    onPress={() => {
                                        this.setState({
                                            orderAcord: '39',
                                            showOrderAcord: this.props.lanData.grouMetFull,
                                        })
                                    }} />
                                <List.Item
                                    title={this.props.lanData.gospVisFull}
                                    titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                                    onPress={() => {
                                        this.setState({
                                            orderAcord: '1473',
                                            showOrderAcord: this.props.lanData.gospVisFull,
                                        })
                                    }} />
                            </ScrollView>
                        </Dialog.ScrollArea>
                        <Dialog.Actions>
                            <Button
                                labelStyle={[this.props.ftszData.paragraph, this.props.themeData.XLtheme]}
                                onPress={() => this.orderAtt(), () => this.arrayFilter(), () => this.setState({ orderAcordOp: false })}
                            >OK</Button>
                        </Dialog.Actions>
                    </Dialog>
                    <Dialog
                        visible={this.state.checkDeleteOp}
                        style={this.props.themeData.LthemeB}
                        onDismiss={() => this.setState({ checkDeleteOp: false })}
                    >
                        <Dialog.Content>
                            <Text style={[this.props.ftszData.paragraph, this.props.themeData.Stheme]}>
                                {this.props.lanData.clearThisFrq}</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button
                                labelStyle={[this.props.ftszData.paragraph, this.props.themeData.XLtheme]}
                                onPress={() => this.deleteFrqLst()}
                            >OK</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        )
    }
}

function mapStateToProps(state) {
    //console.log("mapstate", state.refreshReducer)
    return {
        lanData: state.languageReducer.lanData,
        ftszData: state.fontsizeReducer.ftszData,
        themeData: state.themeReducer.themeData,
        level2: state.level2Reducer.todos,
        level3: state.level3Reducer.todos,
        level4: state.level4Reducer.todos,
        tolAtt: state.tolAttReducer,
        refreshFlag: state.refreshReducer
    }
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            toggleLanguage, toogleFontsize, toogleTheme,
            districtLevel2, districtLevel3, districtLevel4,
            totalAttend, sumAttend, rollCall,
            refreshProp
        }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FrequListScreen)

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
})