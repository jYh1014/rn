
import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons'
import {
  AppRegistry,
  StyleSheet,
  Text,
  TabBarIOS,
  View,
  NavigatorIOS,
  AsyncStorage,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import List from './app/creation/index'
import Edit from './app/edit/index'
import Login from './app/account/login'
import Account from './app/account/index'
import Slider from './app/account/slider'
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
export default class firstIOD extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedTab:'account',
      logined: false,
      user: null,
      booted:false,
      entered:false
    }
  }
  // _renderContent(color: string, pageText: string, num?: number) {
  //   return (
  //     <View style={[styles.tabContent, {backgroundColor: color}]}>
  //       <Text style={styles.tabText}>{pageText}</Text>
  //       <Text style={styles.tabText}>{num} re-renders of the {pageText}</Text>
  //     </View>
  //   );
  // }
  componentDidMount(){
    this._AsyncAppStatus();
  }
_logout(){
  AsyncStorage.removeItem('user');
  this.setState({
    logined: false,
    user: null
  })
}
  _AsyncAppStatus(){
    AsyncStorage.multiGet(['user','entered']).then((data) => {
      let user;
      let userdata = data[0][1]
      let entered = data[1][1]
      console.log(entered)
      this.setState({booted:true})
      let newState = {};
      if (userdata) {
        user = JSON.parse(userdata);
        if (user && user.accessToken) {
          newState.user = user;
          newState.logined = true;
        }else{
          newState.logined = false;
        }
        if(entered == 'yes'){
          newState.entered = true
          // newState.logined = false;
        }
        this.setState(newState);
      }
    })
    // AsyncStorage.removeItem('user')
  }
  _afterLogin(user){
    user = JSON.stringify(user);
    AsyncStorage.setItem('user',user)
    .then(() => {
      this.setState({
        logined: true,
        user: user
      })
    })
  }
  _enterSlide(){
    this.setState({entered:true},() => {
      AsyncStorage.setItem('entered','yes')
    })
  }
  render() {
    if(!this.state.booted){
      return <View style={styles.bootPage}>
        <ActivityIndicator color="#ee735c" />
      </View>
    }
    if(!this.state.entered){
      return <Slider enterSlide={this._enterSlide.bind(this)}/>
    }
    if (!this.state.logined) {
      return <Login afterLogin = {this._afterLogin.bind(this)} />
    }
    return (
      <TabBarIOS unselectedTintColor="yellow" tintColor="#ee735c" >
        <Icon.TabBarItem  iconName='ios-videocam-outline' selectedIconName='ios-videocam' selected={this.state.selectedTab ==='list'}
          onPress={() => {
            this.setState({
              selectedTab: 'list',
            });
          }}>
          <NavigatorIOS
            initialRoute={{
               component: List,
               title: '视频列表',
             }}
             style = {{flex:1}}
             barTintColor = "#ee735c"
             tintColor = "#333"
            />
        </Icon.TabBarItem>
        <Icon.TabBarItem iconName='ios-recording-outline' selectedIconName='ios-recording' badge={1} selected={this.state.selectedTab === 'edit'}
          onPress={() => {
            this.setState({
              selectedTab: 'edit'
            });
          }}>
          <Edit />
        </Icon.TabBarItem>
        <Icon.TabBarItem
        iconName='ios-more-outline' selectedIconName='ios-more'
          selected={this.state.selectedTab === 'account'}
          onPress={() => {
            this.setState({
              selectedTab: 'account',
            });
          }}>
          <Account logout={this._logout.bind(this)} user = {this.state.user}/>
        </Icon.TabBarItem>
      </TabBarIOS>

    );
  }
}

var styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    color: 'white',
    margin: 50,
  },
  bootPage: {
    width:width,
    height:height,
    backgroundColor:'#fff',
    justifyContent:'center'
  }
});
AppRegistry.registerComponent('firstIOD', () => firstIOD);
