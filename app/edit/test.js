
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
const width = Dimensions.get('window').width;
export default class Account extends Component {
  constructor(props){
    super(props);
    this.state={
      auth: {
        nickName:'dddd',
        times:0
      }
    }
  }
  componentDidMount(){
    AsyncStorage.getItem('auth')
    .then((data) => {
      console.log(data);
      let auth;
      if (data) {
        auth = JSON.parse(data);
      }else{
        auth = this.state.auth
      }
      this.setState({auth: auth},() => {
        auth.times++;
        let newAuth = JSON.stringify(auth);
        AsyncStorage.setItem('auth',newAuth).then((data) => {
        })
      });

    })
  }

  render() {
    const user = this.state.user;
    return (
      <View style={styles.container}>
      <Text>不爽了{this.state.auth.times}次</Text>
      
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:'center',
    alignItems:'center'
  },

});
