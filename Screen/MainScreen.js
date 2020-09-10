import React, { Component } from 'react'
import { View, StyleSheet, TextInput, Alert, ScrollView, AsyncStorage } from 'react-native'
import { ActivityIndicator, Button, IconButton, Dialog, Text, Divider, Portal, List } from 'react-native-paper'

// redux
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

// actions
import { toggleLanguage } from '../Actions/toogleLanguage'
import { toogleFontsize } from '../Actions/toogleFontsize'
import { toogleTheme } from '../Actions/toogleTheme'
import { totalAttend } from '../Actions/totalAttend'
import { sumAttend } from '../Actions/sumAttend'

// components

import { Actions } from 'react-native-router-flux' // pages navigation
import moment from 'moment' // time
/**
 * 
 * @class MainScreen 首頁
 * @extends {Component}
 */
class MainScreen extends Component {
    state = {
        /**週次，initial現在 */
        nowWeek: moment(new Date()).format("ww"),
        /**月，initial現在 */
        nowMonth: moment(new Date()).format("MM"),
        /**年，initial現在 */
        nowYear: moment(new Date()).format("yyyy"),
        /**常用名單 */
        frequList: [],
    }
    async componentDidMount() {
        this.getTotalAtt()
        this.getStart()
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
        }
    }
    /**
     * 從AsyncStorage找出常用名單
     */
    getStart = async () => {
        try {
            let a = await AsyncStorage.getItem('frequList')
            if (a) {
                let b = JSON.parse(a)
                let c = []
                b.forEach((e, index) => {
                    c.push({ name: e.name, key: index })
                });
                this.setState({ frequList: c })
                console.log("freqlist MainScreen", b, this.state.frequList)
            }
        } catch (e) { console.log("mainScreen component error", e) }
    }
    /**
     * 呼叫toltalAttend，找出目前點名各個聚會項目數據
     */
    getTotalAtt = async () => {
        const year = this.state.nowYear
        const week = this.state.nowWeek
        await this.props.totalAttend(year, week, '0', '1', '', '', '', '', '')
    }
    /**
     * 將所選擇的常用名單index存入AsyncStorage
     * 跳轉頁面到常用名單
     * @param {number} index - 選擇的常用名單的index 
     */
    callFreqList = async (index) => {
        try {
            await AsyncStorage.setItem('freqListKey', JSON.stringify(index))
            //console.log("freqListKey", await AsyncStorage.getItem('freqListKey'))
            Actions.FrequListScreen()
        } catch (e) { console.log("callFreqList error", e) }
    }
    render() {
        const AttFetch = this.props.tolAtt.isFetching
        if (AttFetch) {
            return (
                <View style={[styles.actInd, this.props.themeData.MthemeB]}>
                    <ActivityIndicator animating={true} color="gray" size='large' />
                </View>
            )
        } else {
            return (
                <View style={[styles.container, this.props.themeData.MthemeB]}>
                    <View style={[this.props.themeData.LthemeB, styles.title]}>
                        <Text style={[this.props.themeData.XLtheme, this.props.ftszData.subhead]}>{this.props.lanData.lordTable}</Text>
                        <Text style={[this.props.themeData.XLtheme, this.props.ftszData.subhead]}>{this.props.lanData.prayer}</Text>
                        <Text style={[this.props.themeData.XLtheme, this.props.ftszData.subhead]}>{this.props.lanData.homeMet}</Text>
                        <Text style={[this.props.themeData.XLtheme, this.props.ftszData.subhead]}>{this.props.lanData.grouMet}</Text>
                        <Text style={[this.props.themeData.XLtheme, this.props.ftszData.subhead]}>{this.props.lanData.gospVis}</Text>
                    </View>
                    <View style={[this.props.themeData.LthemeB, styles.titleContents]}>
                        <Text style={[this.props.themeData.XLtheme, this.props.ftszData.title]}>
                            {this.props.tolAtt.todos.summary ? this.props.tolAtt.todos.summary["37"] ? this.props.tolAtt.todos.summary["37"] : 0 : 0}
                        </Text>
                        <Text style={[this.props.themeData.XLtheme, this.props.ftszData.title]}>
                            {this.props.tolAtt.todos.summary ? this.props.tolAtt.todos.summary["40"] ? this.props.tolAtt.todos.summary["40"] : 0 : 0}
                        </Text>
                        <Text style={[this.props.themeData.XLtheme, this.props.ftszData.title]}>
                            {this.props.tolAtt.todos.summary ? this.props.tolAtt.todos.summary["38"] ? this.props.tolAtt.todos.summary["38"] : 0 : 0}
                        </Text>
                        <Text style={[this.props.themeData.XLtheme, this.props.ftszData.title]}>
                            {this.props.tolAtt.todos.summary ? this.props.tolAtt.todos.summary["39"] ? this.props.tolAtt.todos.summary["39"] : 0 : 0}
                        </Text>
                        <Text style={[this.props.themeData.XLtheme, this.props.ftszData.title]}>
                            {this.props.tolAtt.todos.summary ? this.props.tolAtt.todos.summary["1473"] ? this.props.tolAtt.todos.summary["1473"] : 0 : 0}
                        </Text>
                    </View>
                    <View style={styles.pickerView}>
                        <Button
                            mode="contained"
                            labelStyle={[this.props.ftszData.highlight, this.props.themeData.Ltheme]}
                            contentStyle={{ margin: 20 }}
                            style={[this.props.themeData.XLthemeB,
                            { borderRadius: 18, elevation: 12, marginVertical: 8 }]}
                            onPress={() => Actions.RCScreen()}
                        >{this.props.lanData.rollCall}</Button>
                        <Button
                            mode="contained"
                            labelStyle={[this.props.ftszData.highlight, this.props.themeData.Ltheme]}
                            contentStyle={{ margin: 20 }}
                            style={[this.props.themeData.XLthemeB,
                            { borderRadius: 18, elevation: 12, marginVertical: 8 }]}
                            onPress={() => Actions.StaScreen()}
                        >{this.props.lanData.statis}</Button>
                    </View>
                    <View style={styles.pickerView}>
                        <Button
                            mode="contained"
                            labelStyle={[this.props.ftszData.highlight, this.props.themeData.Ltheme]}
                            contentStyle={{ margin: 20 }}
                            style={[this.props.themeData.XLthemeB,
                            { borderRadius: 18, elevation: 12, marginVertical: 8 }]}
                            onPress={() => Actions.VisitScreen()}
                        >{this.props.lanData.visitList}</Button>
                        <Button
                            mode="contained"
                            labelStyle={[this.props.ftszData.highlight, this.props.themeData.Ltheme]}
                            contentStyle={{ margin: 20 }}
                            style={[this.props.themeData.XLthemeB,
                            { borderRadius: 18, elevation: 12, marginVertical: 8 }]}
                            onPress={() => Actions.SettingScreen()}
                        >{this.props.lanData.setting}</Button>
                    </View>
                    <View style={styles.pickerView}>
                        {this.state.frequList.map((item) => (
                            <Button
                                mode="contained"
                                labelStyle={[this.props.ftszData.title, this.props.themeData.Ltheme]}
                                contentStyle={{ margin: 10 }}
                                style={[this.props.themeData.SthemeB,
                                { borderRadius: 18, elevation: 12, marginVertical: 8 }]}
                                onPress={() => this.callFreqList(item.key)}
                            >{item.name}</Button>
                        ))}
                        <Button
                            mode="contained" icon="pen-plus"
                            labelStyle={[this.props.ftszData.title, this.props.themeData.Ltheme]}
                            contentStyle={{ margin: 10 }}
                            style={[this.props.themeData.SthemeB,
                            { borderRadius: 18, elevation: 12, marginVertical: 8 }]}
                            onPress={() => Actions.AddFreqScreen()}
                        >{this.props.lanData.addNew}</Button>
                    </View>
                </View>
            )
        }
    }
}

function mapStateToProps(state) {
    //console.log("mapState1", state.tolAttReducer.todos.count)
    //console.log("mapState2", state.refreshReducer.flag)
    return {
        lanData: state.languageReducer.lanData,
        ftszData: state.fontsizeReducer.ftszData,
        themeData: state.themeReducer.themeData,
        tolAtt: state.tolAttReducer,
        sumAtt: state.sumAttReducer,
        refreshFlag: state.refreshReducer.flag
    }
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            toggleLanguage, toogleFontsize, toogleTheme, totalAttend, sumAttend
        }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    actInd: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: 6,
        paddingTop: 30,
        width: '100%',
    },
    titleContents: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        padding: 6,
        width: '100%',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    pickerView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        width: '100%',
        flexWrap: 'wrap',
    },
})