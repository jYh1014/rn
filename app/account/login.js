'use strict'
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  AlertIOS
} from 'react-native';

import request from '../common/request'
import config from '../common/config'
import PropTypes from 'prop-types'
import Button from 'react-native-button'
import { CountDownText } from 'react-native-sk-countdown'
var createClass = require('create-react-class')
export default class Login extends Component {
  constructor(props){
    super(props);
    this.state={
      codeSent: false,
      phoneNumber: '',
      verifyCode: '',
      countingDone: false
    }
  }
  _sendVerifyCode(){
    let phoneNumber = this.state.phoneNumber;
    if (!phoneNumber) {
      return AlertIOS.alert('手机号不能为空');
    }
    let body = {
      phoneNumber: phoneNumber
    };
    let signUrl = config.api.base + config.api.signup
    request.post(signUrl,body)
    .then((data) => {
      if (data && data.success) {
        this._showVerifyCode();
      }
      else{
        AlertIOS.alert('获取验证码失败，请检查手机号是否正确')
      }
    })
    .catch((err) => {
      AlertIOS.alert('检查网络是否良好')
    })
  }
  _showVerifyCode(){
    this.setState({
      codeSent: true,
      countingDone: false
    })
  }
  _submit(){
    let phoneNumber = this.state.phoneNumber;
    let verifyCode = this.state.verifyCode;
    let verifyUrl = config.api.base + config.api.verify;
    if (!phoneNumber || !verifyCode) {
      return AlertIOS.alert('手机号或验证码不能为空！')
    }
    let body = {
      phoneNumber: phoneNumber,
      verifyCode: verifyCode
    };
    request.post(verifyUrl,body)
    .then((data) => {
      if (data && data.success) {
        this.props.afterLogin(data.data);
      }
    })
  }
  _countingDone(){
    this.setState({countingDone: true})
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.signupBox}>
          <Text style={styles.title}>快速登录</Text>
          <TextInput
            placeholder='输入手机号'
            autoCorrect={false}
            autoCaptialize={'none'}
            keyboardType={'number-pad'}
            style={styles.inputField}
            onChangeText={(text) => {
              this.setState({phoneNumber:text})
            }}
          />

          {
            this.state.codeSent
            ?<View style={styles.verifyCodeBox}>
            <TextInput
              placeholder='输入验证码'
              autoCorrect={false}
              autoCaptialize={'none'}
              keyboardType={'number-pad'}
              style={[styles.inputField,styles.inputFieldLeft]}
              onChangeText={(text) => {
                this.setState({verifyCode:text})
              }}
              />
              {
                this.state.countingDone?<Button style={styles.countBtn} onPress={this._sendVerifyCode.bind(this)}>获取验证码</Button>
              :<CountDownText
                  style={styles.countBtn}
                  countType='seconds'
                  auto={true}
                  afterEnd={this._countingDone.bind(this)}
                  timeLeft={60}
                  step={-1}
                  startText='获取验证码'
                  endText='获取验证码'
                  intervalText={(sec) => '剩余秒数:' + sec }
                />
              }
            </View>:null
          }
          {
            this.state.codeSent?<Button style={styles.btn} onPress={this._submit.bind(this)}>登录</Button>
            :<Button style={styles.btn} onPress={this._sendVerifyCode.bind(this)}>获取验证码</Button>
          }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:10,
    backgroundColor: '#f9f9f9',
  },
  signupBox: {
    marginTop:30,
  },
  title: {
    marginBottom:20,
    color:'#333',
    fontSize:20,
    textAlign:'center'
  },
  inputField: {
    height:40,
    padding:5,
    color:'#666',
    fontSize:16,
    backgroundColor:'#fff',
    borderRadius:4,
    // flex:1
  },
  inputFieldLeft:{
    flex:1
  },
  btn: {
    padding: 10,
    marginTop:15,
    borderRadius:4,
    borderColor:'#ee735c',
    borderWidth:1,
    backgroundColor:'transparent',
    color:'#ee735c'
  },
  verifyCodeBox: {
    marginTop:10,
    flexDirection:'row',
    justifyContent: 'space-between',
  },
  countBtn: {
    width:110,
    height:40,
    padding:10,
    marginLeft:8,
    backgroundColor:'#ee735c',
    borderColor:'#ee735c',
    textAlign:'left',
    fontSize:15,
    borderRadius:5,
    fontWeight:'600',
    color:'#fff'
  }
})
