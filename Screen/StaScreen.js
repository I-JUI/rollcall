import React, { Component } from 'react'
import { View, StyleSheet, Alert, TextInput, ScrollView, AsyncStorage, Dimensions, Text } from 'react-native'
import {
    ActivityIndicator, Button, IconButton, List,
    Dialog, Divider, Portal, FAB, Snackbar
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
import { LineChart } from 'react-native-chart-kit'
import Slider from '@react-native-community/slider'

class StaScreen extends Component {
    state = {
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
        /**開關選擇統計資料形式的dialog */
        modeOp: false,
        /**統計數據模式選擇，預設perWeek */
        mode: 'perWeek',
        /**統計數據模式選擇的顯示文字 */
        modeSh: this.props.lanData.perWeek,
        /**sumAttend匯出的聖徒主日資料 */
        sumOfLordT: [],
        /**sumAttend匯出的聖徒小排資料 */
        sumOfGroupM: [],
        /**sumAttend匯出的聖徒家聚會資料 */
        sumOfHomeM: [],
        /**sumAttend匯出的聖徒福音出訪資料 */
        sumOfGosP: [],
        /**分享名單用的起始年 */
        shareYearf: '',
        /**分享名單用的起始月 */
        shareMonthf: '',
        /**分享名單用的截止年 */
        shareYearT: '',
        /**分享名單用的截止月 */
        shareMonthT: '',
        /**給chart顯示用，螢幕上最終處理好的資料 */
        endsort: [],
        /**給slider顯示起始日期用 */
        sliderSt: 1
        /**給slider顯示結束日期用 */,
        sliderEn: 19,
        /**給slider顯示日期字串 */
        sliderArray: [],
    }
    async componentDidMount() {
        await this.getTotalAtt()
        await this.dataGenerate()
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
            this.state.identitySel, this.state.groupSel, '')
        const totalFetch = await this.props.tolAtt.isFetching
        if (totalFetch === false) {
            let limit = await this.props.tolAtt.todos.count
            console.log("VisitScreen limit", limit)
            const year_from = month - 5 > 0 ? year : year - 1
            const month_from = month - 5 > 0 ? month - 5 : month + 7
            const year_to = year
            const month_to = month
            await this.props.sumAttend('37', year_from, month_from, year_to, month_to,
                '', this.state.genderSel, this.state.statusSel, this.state.identitySel, this.state.groupSel, limit)
            this.setState({ sumOfLordT: await this.props.sumAtt.todos.stats.rows })
            await this.props.sumAttend('38', year_from, month_from, year_to, month_to,
                '', this.state.genderSel, this.state.statusSel, this.state.identitySel, this.state.groupSel, limit)
            this.setState({ sumOfHomeM: await this.props.sumAtt.todos.stats.rows })
            await this.props.sumAttend('39', year_from, month_from, year_to, month_to,
                '', this.state.genderSel, this.state.statusSel, this.state.identitySel, this.state.groupSel, limit)
            this.setState({ sumOfGroupM: await this.props.sumAtt.todos.stats.rows })
            await this.props.sumAttend('1473', year_from, month_from, year_to, month_to,
                '', this.state.genderSel, this.state.statusSel, this.state.identitySel, this.state.groupSel, limit)
            let arr = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]
            let arra = []
            for (let va of arr) {
                let str = moment(year_from + '/' + month_from + '/01', "yyyy/MM/DD").day("Monday").day(parseInt(va) * 7 + 1).format("MM/DD~") +
                    moment(year_from + '/' + month_from + '/01', "yyyy/MM/DD").day("Monday").day(parseInt(va) * 7 + 7).format("MM/DD")
                arra[parseInt(va) - 7] = str
            }
            console.log("date", arra)
            this.setState({
                sumOfGosP: await this.props.sumAtt.todos.stats.rows,
                shareYearf: year_from, shareMonthf: month_from,
                shareYearT: year_to, shareMonthT: month_to,
                sliderArray: arra
            })
        }
    }
    dataGenerate = async () => {
        /**sumAtt抓資料結束時是false */
        const orderCalFetch = await this.props.sumAtt.isFetching
        /**sumAttend匯出的聖徒主日資料 */
        let origLo = this.state.sumOfLordT
        /**sumAttend匯出的聖徒家聚會資料 */
        let origHo = this.state.sumOfHomeM
        /**sumAttend匯出的聖徒小排資料 */
        let origGr = this.state.sumOfGroupM
        /**sumAttend匯出的聖徒福音出訪資料 */
        let origGo = this.state.sumOfGosP
        let sumLo = []
        let sumHo = []
        let sumGr = []
        let sumGo = []
        let sumLo1 = []
        let sumHo1 = []
        let sumGr1 = []
        let sumGo1 = []
        if (orderCalFetch === false) {
            origLo.forEach((obj) => {
                sumLo.push({
                    'w1': obj["21"] === null ? 0 : parseInt(obj["21"]),
                    'w2': obj["22"] === null ? 0 : parseInt(obj["22"]),
                    'w3': obj["23"] === null ? 0 : parseInt(obj["23"]),
                    'w4': obj["24"] === null ? 0 : parseInt(obj["24"]),
                    'w5': obj["25"] === null ? 0 : parseInt(obj["25"]),
                    'w6': obj["26"] === null ? 0 : parseInt(obj["26"]),
                    'w7': obj["27"] === null ? 0 : parseInt(obj["27"]),
                    'w8': obj["28"] === null ? 0 : parseInt(obj["28"]),
                    'w9': obj["29"] === null ? 0 : parseInt(obj["29"]),
                    'w10': obj["30"] === null ? 0 : parseInt(obj["30"]),
                    'w11': obj["31"] === null ? 0 : parseInt(obj["31"]),
                    'w12': obj["32"] === null ? 0 : parseInt(obj["32"]),
                    'w13': obj["33"] === null ? 0 : parseInt(obj["33"]),
                    'w14': obj["34"] === null ? 0 : parseInt(obj["34"]),
                    'w15': obj["35"] === null ? 0 : parseInt(obj["35"]),
                    'w16': obj["36"] === null ? 0 : parseInt(obj["36"]),
                    'w17': obj["37"] === null ? 0 : parseInt(obj["37"]),
                    'w18': obj["38"] === null ? 0 : parseInt(obj["38"]),
                    'w19': obj["39"] === null ? 0 : parseInt(obj["39"])
                })
            })
            sumLo1 = [
                sumLo.reduce((acc, cur) => acc + cur.w1, 0),
                sumLo.reduce((acc, cur) => acc + cur.w2, 0),
                sumLo.reduce((acc, cur) => acc + cur.w3, 0),
                sumLo.reduce((acc, cur) => acc + cur.w4, 0),
                sumLo.reduce((acc, cur) => acc + cur.w5, 0),
                sumLo.reduce((acc, cur) => acc + cur.w6, 0),
                sumLo.reduce((acc, cur) => acc + cur.w7, 0),
                sumLo.reduce((acc, cur) => acc + cur.w8, 0),
                sumLo.reduce((acc, cur) => acc + cur.w9, 0),
                sumLo.reduce((acc, cur) => acc + cur.w10, 0),
                sumLo.reduce((acc, cur) => acc + cur.w11, 0),
                sumLo.reduce((acc, cur) => acc + cur.w12, 0),
                sumLo.reduce((acc, cur) => acc + cur.w13, 0),
                sumLo.reduce((acc, cur) => acc + cur.w14, 0),
                sumLo.reduce((acc, cur) => acc + cur.w15, 0),
                sumLo.reduce((acc, cur) => acc + cur.w16, 0),
                sumLo.reduce((acc, cur) => acc + cur.w17, 0),
                sumLo.reduce((acc, cur) => acc + cur.w18, 0),
                sumLo.reduce((acc, cur) => acc + cur.w19, 0),
            ]
            origHo.forEach((obj) => {
                sumHo.push({
                    'w1': obj["21"] === null ? 0 : parseInt(obj["21"]),
                    'w2': obj["22"] === null ? 0 : parseInt(obj["22"]),
                    'w3': obj["23"] === null ? 0 : parseInt(obj["23"]),
                    'w4': obj["24"] === null ? 0 : parseInt(obj["24"]),
                    'w5': obj["25"] === null ? 0 : parseInt(obj["25"]),
                    'w6': obj["26"] === null ? 0 : parseInt(obj["26"]),
                    'w7': obj["27"] === null ? 0 : parseInt(obj["27"]),
                    'w8': obj["28"] === null ? 0 : parseInt(obj["28"]),
                    'w9': obj["29"] === null ? 0 : parseInt(obj["29"]),
                    'w10': obj["30"] === null ? 0 : parseInt(obj["30"]),
                    'w11': obj["31"] === null ? 0 : parseInt(obj["31"]),
                    'w12': obj["32"] === null ? 0 : parseInt(obj["32"]),
                    'w13': obj["33"] === null ? 0 : parseInt(obj["33"]),
                    'w14': obj["34"] === null ? 0 : parseInt(obj["34"]),
                    'w15': obj["35"] === null ? 0 : parseInt(obj["35"]),
                    'w16': obj["36"] === null ? 0 : parseInt(obj["36"]),
                    'w17': obj["37"] === null ? 0 : parseInt(obj["37"]),
                    'w18': obj["38"] === null ? 0 : parseInt(obj["38"]),
                    'w19': obj["39"] === null ? 0 : parseInt(obj["39"])
                })
            })
            sumHo1 = [
                sumHo.reduce((acc, cur) => acc + cur.w1, 0),
                sumHo.reduce((acc, cur) => acc + cur.w2, 0),
                sumHo.reduce((acc, cur) => acc + cur.w3, 0),
                sumHo.reduce((acc, cur) => acc + cur.w4, 0),
                sumHo.reduce((acc, cur) => acc + cur.w5, 0),
                sumHo.reduce((acc, cur) => acc + cur.w6, 0),
                sumHo.reduce((acc, cur) => acc + cur.w7, 0),
                sumHo.reduce((acc, cur) => acc + cur.w8, 0),
                sumHo.reduce((acc, cur) => acc + cur.w9, 0),
                sumHo.reduce((acc, cur) => acc + cur.w10, 0),
                sumHo.reduce((acc, cur) => acc + cur.w11, 0),
                sumHo.reduce((acc, cur) => acc + cur.w12, 0),
                sumHo.reduce((acc, cur) => acc + cur.w13, 0),
                sumHo.reduce((acc, cur) => acc + cur.w14, 0),
                sumHo.reduce((acc, cur) => acc + cur.w15, 0),
                sumHo.reduce((acc, cur) => acc + cur.w16, 0),
                sumHo.reduce((acc, cur) => acc + cur.w17, 0),
                sumHo.reduce((acc, cur) => acc + cur.w18, 0),
                sumHo.reduce((acc, cur) => acc + cur.w19, 0),
            ]
            origGr.forEach((obj) => {
                sumGr.push({
                    'w1': obj["21"] === null ? 0 : parseInt(obj["21"]),
                    'w2': obj["22"] === null ? 0 : parseInt(obj["22"]),
                    'w3': obj["23"] === null ? 0 : parseInt(obj["23"]),
                    'w4': obj["24"] === null ? 0 : parseInt(obj["24"]),
                    'w5': obj["25"] === null ? 0 : parseInt(obj["25"]),
                    'w6': obj["26"] === null ? 0 : parseInt(obj["26"]),
                    'w7': obj["27"] === null ? 0 : parseInt(obj["27"]),
                    'w8': obj["28"] === null ? 0 : parseInt(obj["28"]),
                    'w9': obj["29"] === null ? 0 : parseInt(obj["29"]),
                    'w10': obj["30"] === null ? 0 : parseInt(obj["30"]),
                    'w11': obj["31"] === null ? 0 : parseInt(obj["31"]),
                    'w12': obj["32"] === null ? 0 : parseInt(obj["32"]),
                    'w13': obj["33"] === null ? 0 : parseInt(obj["33"]),
                    'w14': obj["34"] === null ? 0 : parseInt(obj["34"]),
                    'w15': obj["35"] === null ? 0 : parseInt(obj["35"]),
                    'w16': obj["36"] === null ? 0 : parseInt(obj["36"]),
                    'w17': obj["37"] === null ? 0 : parseInt(obj["37"]),
                    'w18': obj["38"] === null ? 0 : parseInt(obj["38"]),
                    'w19': obj["39"] === null ? 0 : parseInt(obj["39"])
                })
            })
            sumGr1 = [
                sumGr.reduce((acc, cur) => acc + cur.w1, 0),
                sumGr.reduce((acc, cur) => acc + cur.w2, 0),
                sumGr.reduce((acc, cur) => acc + cur.w3, 0),
                sumGr.reduce((acc, cur) => acc + cur.w4, 0),
                sumGr.reduce((acc, cur) => acc + cur.w5, 0),
                sumGr.reduce((acc, cur) => acc + cur.w6, 0),
                sumGr.reduce((acc, cur) => acc + cur.w7, 0),
                sumGr.reduce((acc, cur) => acc + cur.w8, 0),
                sumGr.reduce((acc, cur) => acc + cur.w9, 0),
                sumGr.reduce((acc, cur) => acc + cur.w10, 0),
                sumGr.reduce((acc, cur) => acc + cur.w11, 0),
                sumGr.reduce((acc, cur) => acc + cur.w12, 0),
                sumGr.reduce((acc, cur) => acc + cur.w13, 0),
                sumGr.reduce((acc, cur) => acc + cur.w14, 0),
                sumGr.reduce((acc, cur) => acc + cur.w15, 0),
                sumGr.reduce((acc, cur) => acc + cur.w16, 0),
                sumGr.reduce((acc, cur) => acc + cur.w17, 0),
                sumGr.reduce((acc, cur) => acc + cur.w18, 0),
                sumGr.reduce((acc, cur) => acc + cur.w19, 0),
            ]
            origGo.forEach((obj) => {
                sumGo.push({
                    'w1': obj["21"] === null ? 0 : parseInt(obj["21"]),
                    'w2': obj["22"] === null ? 0 : parseInt(obj["22"]),
                    'w3': obj["23"] === null ? 0 : parseInt(obj["23"]),
                    'w4': obj["24"] === null ? 0 : parseInt(obj["24"]),
                    'w5': obj["25"] === null ? 0 : parseInt(obj["25"]),
                    'w6': obj["26"] === null ? 0 : parseInt(obj["26"]),
                    'w7': obj["27"] === null ? 0 : parseInt(obj["27"]),
                    'w8': obj["28"] === null ? 0 : parseInt(obj["28"]),
                    'w9': obj["29"] === null ? 0 : parseInt(obj["29"]),
                    'w10': obj["30"] === null ? 0 : parseInt(obj["30"]),
                    'w11': obj["31"] === null ? 0 : parseInt(obj["31"]),
                    'w12': obj["32"] === null ? 0 : parseInt(obj["32"]),
                    'w13': obj["33"] === null ? 0 : parseInt(obj["33"]),
                    'w14': obj["34"] === null ? 0 : parseInt(obj["34"]),
                    'w15': obj["35"] === null ? 0 : parseInt(obj["35"]),
                    'w16': obj["36"] === null ? 0 : parseInt(obj["36"]),
                    'w17': obj["37"] === null ? 0 : parseInt(obj["37"]),
                    'w18': obj["38"] === null ? 0 : parseInt(obj["38"]),
                    'w19': obj["39"] === null ? 0 : parseInt(obj["39"])
                })
            })
            sumGo1 = [
                sumGo.reduce((acc, cur) => acc + cur.w1, 0),
                sumGo.reduce((acc, cur) => acc + cur.w2, 0),
                sumGo.reduce((acc, cur) => acc + cur.w3, 0),
                sumGo.reduce((acc, cur) => acc + cur.w4, 0),
                sumGo.reduce((acc, cur) => acc + cur.w5, 0),
                sumGo.reduce((acc, cur) => acc + cur.w6, 0),
                sumGo.reduce((acc, cur) => acc + cur.w7, 0),
                sumGo.reduce((acc, cur) => acc + cur.w8, 0),
                sumGo.reduce((acc, cur) => acc + cur.w9, 0),
                sumGo.reduce((acc, cur) => acc + cur.w10, 0),
                sumGo.reduce((acc, cur) => acc + cur.w11, 0),
                sumGo.reduce((acc, cur) => acc + cur.w12, 0),
                sumGo.reduce((acc, cur) => acc + cur.w13, 0),
                sumGo.reduce((acc, cur) => acc + cur.w14, 0),
                sumGo.reduce((acc, cur) => acc + cur.w15, 0),
                sumGo.reduce((acc, cur) => acc + cur.w16, 0),
                sumGo.reduce((acc, cur) => acc + cur.w17, 0),
                sumGo.reduce((acc, cur) => acc + cur.w18, 0),
                sumGo.reduce((acc, cur) => acc + cur.w19, 0),
            ]
            this.setState({
                endsort: { LoData: sumLo1, HoData: sumHo1, GrData: sumGr1, GoData: sumGo1 },
            })
        }
    }
    arrayFilter = async () => {
        await this.getTotalAtt()
        await this.dataGenerate()
    }
    sliderText = (value) => {
        const array = this.state.sliderArray
        _valueChange.setNativeProps({ text: array[value] })
    }
    sliderTextEnd = (value) => {
        const array = this.state.sliderArray
        _vlaueChangeEnd.setNativeProps({ text: array[value] })
    }
    render() {
        const AttFetch = this.props.sumAtt.isFetching
        let ensLo = this.state.endsort.LoData
        let Lodata = { datasets: [{ data: ensLo ? ensLo.slice(this.state.sliderSt, this.state.sliderEn) : [], }], }
        let ensHo = this.state.endsort.HoData
        let Hodata = { datasets: [{ data: ensHo ? ensHo.slice(this.state.sliderSt, this.state.sliderEn) : [], }], }
        let ensGr = this.state.endsort.GrData
        let Grdata = { datasets: [{ data: ensGr ? ensGr.slice(this.state.sliderSt, this.state.sliderEn) : [], }], }
        let ensGo = this.state.endsort.GoData
        let Godata = { datasets: [{ data: ensGo ? ensGo.slice(this.state.sliderSt, this.state.sliderEn) : [], }], }
        const screenWidth = Dimensions.get("window").width
        const chartConfig = {
            backgroundGradientFrom: this.props.themeData.MthemeC,
            backgroundGradientFromOpacity: 0,//透明度
            backgroundGradientTo: this.props.themeData.MthemeC, //搞漸層用
            backgroundGradientToOpacity: 0,//漸層的透明度
            decimalPlaces: 0, //小數點
            color: (opacity = 1) =>
                `rgba(${this.props.themeData.XLthemergb[0]}, ${this.props.themeData.XLthemergb[1]}, ${this.props.themeData.XLthemergb[2]}, ${opacity})`,
            strokeWidth: 5, // 點點多粗
            barPercentage: 0.5,
            useShadowColorFromDataset: false, // optional
            propsForBackgroundLines: {
                strokeDasharray: "3",//實心背景線是""
            },
        };
        return (
            <View style={[styles.container, this.props.themeData.MthemeB]}>
                <View style={styles.titleCard}>
                    <Button
                        mode="contained" icon="menu-down"
                        labelStyle={[this.props.ftszData.paragraph, this.props.themeData.Ltheme]}
                        style={[this.props.themeData.SthemeB, { borderRadius: 18, elevation: 12, marginHorizontal: 5 }]}
                        onPress={() => this.setState({ modeOp: true })}
                    >{this.state.modeSh}</Button>
                    <IconButton icon="tune-vertical" size={25} color={this.props.themeData.SthemeC}
                        onPress={() => this.setState({ alotsOp: true })} style={{ elevation: 15 }}
                    />
                    <IconButton icon="account-group" size={25} color={this.props.themeData.SthemeC}
                        onPress={() => this.DistrictRender()} style={{ elevation: 15 }}
                    />
                </View>
                {AttFetch ?
                    <View style={[styles.actInd, this.props.themeData.MthemeB]}>
                        <ActivityIndicator animating={true} color="gray" size='large' />
                    </View> :
                    <ScrollView
                        contentContainerStyle={{ width: "100%", justifyContent: 'flex-start', alignItems: 'center' }}
                        ref={(ref) => this.myScroll = ref}>
                        <View style={styles.dateText}>
                            <TextInput style={[this.props.themeData.XLtheme, this.props.ftszData.paragraph]}
                                ref={component => (_valueChange = component)} editable={false}
                                defaultValue={this.state.sliderArray[0]}
                            />
                            <TextInput style={[this.props.themeData.XLtheme, this.props.ftszData.paragraph]}
                                ref={component => (_vlaueChangeEnd = component)} editable={false}
                                defaultValue={this.state.sliderArray[19]}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                            <Slider
                                style={{ width: "45%", height: 40 }}
                                minimumValue={1}
                                maximumValue={19}
                                minimumTrackTintColor={this.props.themeData.SthemeC}
                                maximumTrackTintColor={this.props.themeData.SthemeC}
                                onValueChange={(v) => this.sliderText(v.toFixed(0))}
                                onSlidingComplete={(v) => this.setState({ sliderSt: v.toFixed(0) })}
                            />
                            <Slider
                                style={{ width: "45%", height: 40 }}
                                minimumValue={1}
                                maximumValue={19}
                                minimumTrackTintColor={this.props.themeData.SthemeC}
                                maximumTrackTintColor={this.props.themeData.SthemeC}
                                onValueChange={(v) => this.sliderTextEnd(v.toFixed(0))}
                                onSlidingComplete={(v) => this.setState({ sliderEn: v.toFixed(0) })}
                            />
                        </View>
                        <View style={[styles.chartView, this.props.themeData.SthemeBo]}>
                            <View style={styles.chartTextView}>
                                <Text style={[this.props.themeData.XLtheme, this.props.ftszData.subhead]}>
                                    {this.props.lanData.lordTableFull + this.props.lanData.perWeek}</Text>
                            </View>
                            <LineChart
                                data={Lodata} width={screenWidth * 0.85}
                                height={160} verticalLabelRotation={0}
                                chartConfig={chartConfig} bezier
                                style={styles.lineChart}
                                segments={3} withShadow={false}
                                onDataPointClick={(data) => { }}
                            />
                        </View>
                        <View style={[styles.chartView, this.props.themeData.SthemeBo]}>
                            <View style={styles.chartTextView}>
                                <Text style={[this.props.themeData.XLtheme, this.props.ftszData.subhead]}>
                                    {this.props.lanData.homeMetFull + this.props.lanData.perWeek}</Text>
                            </View>
                            <LineChart
                                data={Hodata} width={screenWidth * 0.85}
                                height={160} verticalLabelRotation={0}
                                chartConfig={chartConfig} bezier
                                style={styles.lineChart}
                                segments={3} withShadow={false}
                                onDataPointClick={(data) => { }}
                            />
                        </View>
                        <View style={[styles.chartView, this.props.themeData.SthemeBo]}>
                            <View style={styles.chartTextView}>
                                <Text style={[this.props.themeData.XLtheme, this.props.ftszData.subhead]}>
                                    {this.props.lanData.grouMetFull + this.props.lanData.perWeek}</Text>
                            </View>
                            <LineChart
                                data={Grdata} width={screenWidth * 0.85}
                                height={160} verticalLabelRotation={0}
                                chartConfig={chartConfig} bezier
                                style={styles.lineChart}
                                segments={3} withShadow={false}
                                onDataPointClick={(data) => { }}
                            />
                        </View>
                        <View style={[styles.chartView, this.props.themeData.SthemeBo]}>
                            <View style={styles.chartTextView}>
                                <Text style={[this.props.themeData.XLtheme, this.props.ftszData.subhead]}>
                                    {this.props.lanData.gospVisFull + this.props.lanData.perWeek}</Text>
                            </View>
                            <LineChart
                                data={Godata} width={screenWidth * 0.85}
                                height={160} verticalLabelRotation={0}
                                chartConfig={chartConfig} bezier
                                style={styles.lineChart}
                                segments={3} withShadow={false}
                                onDataPointClick={(data) => { }}
                            />
                        </View>

                    </ScrollView>
                }
                <Portal>
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
                                onPress={() => { }}
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
                                onPress={() => { }}
                            >OK</Button>
                        </Dialog.Actions>
                    </Dialog>
                    <Dialog
                        visible={this.state.modeOp}
                        style={this.props.themeData.LthemeB}
                        onDismiss={() => this.setState({ modeOp: false })}
                    >
                        <List.Item
                            title={this.props.lanData.perWeek}
                            titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                            onPress={() => {
                                this.setState({
                                    mode: 'perWeek', modeSh: this.props.lanData.perWeek
                                })
                            }}
                        />
                        <List.Item
                            title={this.props.lanData.perMonth}
                            titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                            onPress={() => {
                                this.setState({
                                    mode: 'perMonth', modeSh: this.props.lanData.perMonth
                                })
                            }}
                        />
                        <List.Item
                            title={this.props.lanData.ageLayerPie}
                            titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                            onPress={() => {
                                this.setState({
                                    mode: 'ageLayerPie', modeSh: this.props.lanData.ageLayerPie
                                })
                            }}
                        />
                        <List.Item
                            title={this.props.lanData.stableStackBar}
                            titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                            onPress={() => {
                                this.setState({
                                    mode: 'stableStackBar', modeSh: this.props.lanData.stableStackBar
                                })
                            }}
                        />
                        <Dialog.Actions>
                            <Button
                                labelStyle={[this.props.ftszData.paragraph, this.props.themeData.XLtheme]}
                                onPress={() => { }}
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

export default connect(mapStateToProps, mapDispatchToProps)(StaScreen)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    chartView: {
        marginTop: 5,
        width: "95%",
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        borderWidth: 0.8,
    },
    chartTextView: {
        width: "100%",
        margin: 5,
    },
    lineChart: {
        marginVertical: 3,
        marginRight: 15,
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
    actInd: {
        height: "90%",
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateText: {
        width: "100%",
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingTop: 5
    },
})