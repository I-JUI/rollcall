import React, { Component } from 'react'
import { Router, Scene, Drawer, Stack } from 'react-native-router-flux'

import LoginScreen from './LoginScreen'
import RCScreen from './RCSreen'
import SettingScreen from './SettingScreen'
import MainScreen from './MainScreen'
import VisitScreen from './VisitScreen'
import StaScreen from './StaScreen'
import AddFreqScreen from './AddFreqScreen'
import FrequListScreen from './FrequListScreen'
import EditFrqLstScreen from './EditFrqLstScreen'

class IndexRouter extends Component {
    render() {
        return (
            <Router>
                <Stack key="root">
                    <Scene key="LoginScreen"
                        hideNavBar={true} initial
                        component={LoginScreen}
                    />
                    <Scene key="MainScreen"
                        hideNavBar={true}
                        component={MainScreen}
                    />
                    <Scene key="RCScreen"
                        hideNavBar={true}
                        component={RCScreen}
                    />
                    <Scene key="VisitScreen"
                        hideNavBar={true}
                        component={VisitScreen}
                    />
                    <Scene key="StaScreen"
                        hideNavBar={true}
                        component={StaScreen}
                    />
                    <Scene key="SettingScreen"
                        hideNavBar={true}
                        component={SettingScreen}
                    />
                    <Scene key="AddFreqScreen"
                        hideNavBar={true}
                        component={AddFreqScreen}
                    />
                    <Scene key="FrequListScreen"
                        hideNavBar={true}
                        component={FrequListScreen}
                    />
                    <Scene key="EditFrqLstScreen"
                        hideNavBar={true}
                        component={EditFrqLstScreen}
                    />
                </Stack>
            </Router >
        )
    }
}

export default IndexRouter;