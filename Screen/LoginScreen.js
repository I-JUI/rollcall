import React, { Component } from 'react'
import { View, StyleSheet, TextInput, Alert, ScrollView, AsyncStorage } from 'react-native'
import { Button, Dialog, Portal, List } from 'react-native-paper'

// redux
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

// actions
import { toggleLanguage } from '../Actions/toogleLanguage'
import { toogleFontsize } from '../Actions/toogleFontsize'
import { toogleTheme } from '../Actions/toogleTheme'
import { getDistrict } from '../Actions/getDistrict'
import { login } from '../Actions/login'

//components
import { churchList } from '../Component/churchList' // 召會列表

import { Actions } from 'react-native-router-flux' // pages navigation
import moment from 'moment' // time

/**
 * 
 * @class LoginScreen 登入頁面
 * @extends {Component}
 */
class LoginScreen extends Component {
    state = {
        /**召會/大區名稱，除了台北市召會，其他的選了不會有事情發生 */
        districtName: '台北市召會',
        /**與districtName對應的召會/大區id */
        districtId: '1',
        /**開關districName的Dialog */
        districtOp: false,
        /**會所名稱 */
        churchName: '',
        /**開關churchName會所列表的Dialog */
        churchOp: false,
        /**帳號 */
        account: '',
        /**驗證碼，目前沒用到 */
        captcha_code: '',
        /**會所id */
        church_id: '0',
        /**排區架構第一層之意，在此都為1 */
        district: '1',
        /**語言選擇，default中文  */
        language: 'zh-tw',
        /**密碼  */
        pwd: '',
    }
    async componentDidMount() {
        try {
            console.log("componentDidMount asyncstorage",
                await AsyncStorage.multiGet(['fontSize', 'theme', 'language', 'account'])
            )
            await this.props.toogleFontsize(
                await AsyncStorage.getItem('fontSize') ? await AsyncStorage.getItem('fontSize') : 'medium'
            )
            await this.props.toogleTheme(
                await AsyncStorage.getItem('theme') ? await AsyncStorage.getItem('theme') : 'starWhite'
            )
            await this.props.toggleLanguage(
                await AsyncStorage.getItem('language') ? await AsyncStorage.getItem('language') : 'zh'
            )
            this.setState({
                account: await AsyncStorage.getItem('account') ? await AsyncStorage.getItem('account') : '',
                church_id: await AsyncStorage.getItem('church_id') ? await AsyncStorage.getItem('church_id') : '0',
                pwd: await AsyncStorage.getItem('pwd') ? await AsyncStorage.getItem('pwd') : ''
            })
            const { account, church_id, district, language, pwd } = this.state
            await this.props.login({ account, church_id, district, language, pwd })
            //await AsyncStorage.multiRemove(['account', 'church_id', 'district', 'language', 'pwd'])
        } catch (e) {
            console.log("componentDidMount", e)
        }
    }
    /**
     * 當this.props.loginLength改變時，也就是從沒有登入變成登入成功，或登入失敗變成登入成功，或沒有登入變成登入失敗
     * 執行loginSelect
     * @param {object} prevProps - 前一個props 
     */
    componentDidUpdate(prevProps) {
        if (prevProps.loginLength !== this.props.loginLength) {
            this.loginSelect()
        }
    }
    /**
     * 取得台北市召會的會所列表
     */
    getDistrictApi = () => {
        if (this.state.districtId === '1') {
            this.props.getDistrict()
        }
    }
    /**
     * 執行登入動作
     */
    onLogin = () => {
        const { account, church_id, district, language, pwd } = this.state
        this.props.login({ account, church_id, district, language, pwd })
    }
    /**
     * 用回傳的html.length判斷是否成功登入
     * */
    loginSelect = async () => {
        if (this.props.loginLength >= 112000) {
            try {
                console.log("login success", this.props.loginLength)
                await AsyncStorage.multiSet([
                    ['account', this.state.account], ['church_id', this.state.church_id],
                    ['district', this.state.district], ['language', this.state.language],
                    ['pwd', this.state.pwd]
                ])
                console.log("save loginInfo",
                    await AsyncStorage.multiGet(['account', 'church_id', 'district', 'language', 'pwd'])
                )
                Actions.MainScreen()
            } catch (e) { console.log("loginSelect error", e) }
            console.log("login success", this.props.loginLength)
        }
        else if (this.props.loginLength <= 100000) {
            this.setState({ account: '', pwd: '' })
            const title = String(this.props.lanData.logErrTitle)
            const msg = String(this.props.lanData.logErrMsg)
            return (
                Alert.alert(
                    title, msg,
                    [{ text: 'OK'/*, onPress: () => console.log('OK Pressed')*/ },]
                )
            )
        }
    }
    /**
     * 使用setNativeProps使setState不會一直被重複呼叫，減少render的次數
     * @param {number} value - 輸入帳號的input value
     */
    accountInput = (value) =>{
        _accountChange.setNativeProps({ text: value })
    }
    /**
     * 使用setNativeProps使setState不會一直被重複呼叫，減少render的次數
     * @param {number} value - 輸入密碼的input value
     */
    pwdInput = (value) =>{
        _pwdChange.setNativeProps({ text: value })
    }
    render() {
        return (
            <View style={[styles.container, this.props.themeData.MthemeB]}>
                <View style={styles.pickerView}>
                    <Button
                        icon="menu-down" mode="contained"
                        labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                        contentStyle={{ width: 230 }}
                        style={[this.props.themeData.XLthemeB,
                        { borderRadius: 18, elevation: 12, marginVertical: 8, paddingHorizontal: 10 }]}
                        onPress={() => this.setState({ districtOp: true })}
                    >{this.state.districtName}</Button>
                </View>
                <View style={styles.pickerView}>
                    <Button
                        icon="menu-down" mode="contained"
                        labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                        contentStyle={{ width: 230 }}
                        style={[this.props.themeData.XLthemeB,
                        { borderRadius: 18, elevation: 12, marginVertical: 8, paddingHorizontal: 10 }]}
                        onPress={() => { this.setState({ churchOp: true }, this.getDistrictApi) }}
                    >{this.state.churchName}</Button>
                </View>
                <View style={styles.pickerView}>
                    <TextInput
                        autoCapitalize='none' placeholderTextColor={this.props.themeData.Stheme}
                        placeholder={this.props.lanData.account}
                        ref={component => (_accountChange = component)}
                        onSubmitEditing={(event) => this.setState({ account: event.nativeEvent.text })}
                        textAlignVertical="center"
                        style={[
                            this.props.themeData.MthemeB, this.props.ftszData.button,
                            this.props.themeData.SthemeBo, this.props.themeData.XLtheme, styles.textInput
                        ]}
                    />
                </View>
                <View style={styles.pickerView}>
                    <TextInput
                        autoCapitalize='none' placeholderTextColor={this.props.themeData.Stheme}
                        placeholder={this.props.lanData.password}
                        secureTextEntry={true}
                        ref={component => (_pwdChange = component)}
                        onSubmitEditing={(event) => this.setState({ pwd: event.nativeEvent.text })}
                        textAlignVertical="center"
                        style={[
                            this.props.themeData.MthemeB, this.props.ftszData.button,
                            this.props.themeData.SthemeBo, this.props.themeData.XLtheme, styles.textInput
                        ]}
                    />
                </View>
                <View style={styles.pickerView}>
                    <Button
                        mode="contained"
                        labelStyle={[this.props.ftszData.button, this.props.themeData.Ltheme]}
                        contentStyle={{ width: 150 }}
                        style={[this.props.themeData.SthemeB, { borderRadius: 18, elevation: 12, marginVertical: 8 }]}
                        onPress={() => this.onLogin()}
                    >{this.props.lanData.logIn}</Button>
                </View>
                <View style={{ justifyContent: 'space-around', width: 200, flexDirection: 'row', flexWrap: 'wrap' }}>
                    <Button
                        labelStyle={[this.props.ftszData.paragraph, this.props.themeData.SStheme]}
                        onPress={() => {}}
                    >{this.props.lanData.noAccount}</Button>
                    <Button
                        labelStyle={[this.props.ftszData.paragraph, this.props.themeData.SStheme]}
                        onPress={() => { }}
                    >{this.props.lanData.forgotAccount}</Button>
                </View>
                <Button
                    labelStyle={[this.props.ftszData.paragraph, this.props.themeData.SStheme]}
                    onPress={() => Actions.SettingScreen()}
                >{this.props.lanData.settingPage}</Button>
                <Portal>
                    <Dialog
                        visible={this.state.districtOp}
                        onDismiss={() => this.setState({ districtOp: false })}
                        style={this.props.themeData.LthemeB}
                    >
                        <Dialog.ScrollArea>
                            <ScrollView contentContainerStyle={{ paddingTop: 24 }}>
                                {churchList.map((item) => (
                                    <List.Item
                                        title={item.label} key={item.key}
                                        titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                                        onPress={() => this.setState({ districtName: item.label, districtId: item.key, districtOp: false })}
                                    />
                                ))}
                            </ScrollView>
                        </Dialog.ScrollArea>
                    </Dialog>
                    <Dialog
                        visible={this.state.churchOp}
                        onDismiss={() => this.setState({ churchOp: false })}
                        style={this.props.themeData.LthemeB}
                    >
                        <Dialog.ScrollArea>
                            <ScrollView contentContainerStyle={{ paddingTop: 24 }}>
                                {this.props.distData.map((item) => (
                                    <List.Item
                                        title={item.church_name} key={item.church_id}
                                        titleStyle={[this.props.themeData.Stheme, this.props.ftszData.subhead]}
                                        onPress={() => this.setState({ churchName: item.church_name, church_id: item.church_id, churchOp: false })}
                                    />
                                ))}
                            </ScrollView>
                        </Dialog.ScrollArea>
                    </Dialog>
                </Portal>
            </View>
        )
    }
}

function mapStateToProps(state) {
    //console.log("mapState", state.gtDistrictReducer.isFetching)
    return {
        lanData: state.languageReducer.lanData,
        ftszData: state.fontsizeReducer.ftszData,
        themeData: state.themeReducer.themeData,
        distData: state.gtDistrictReducer.todos,
        loginLength: state.loginReducer.todos,
        loginDone: state.loginReducer.isFetching,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            toggleLanguage, toogleFontsize, toogleTheme, getDistrict, login
        }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickerView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    textInput: {
        borderRadius: 18,
        borderWidth: 2,
        elevation: 12,
        marginVertical: 8,
        width: 250,
        paddingVertical: 5,
        paddingLeft: 20,
    },
})