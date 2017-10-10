
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  AsyncStorage,
  ProgressViewIOS,
  AlertIOS
} from 'react-native';
import request from '../common/request'
import config from '../common/config'
const ImagePicker = require('react-native-image-picker')
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import PropTypes from 'prop-types'
import  Video  from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons'
import { CountDownText } from 'react-native-sk-countdown'
import CountDownTimer from 'react_native_countdowntimer'
const videoOptions = {
  title: '选择视频',
  cancelButtonTitle: '取消',
  takePhotoButtonTitle: '录制10秒视频',
  chooseFromLibraryButtonTitle: '选择已有视频',
  videoQuality:'medium',
  mediaType:'video',
  durationLimit:10,
  noData: false,
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};
export default class Edit extends Component {
  constructor(props){
    super(props);
    this.state={
      previewVideo:null,
      rate: 1,
      muted: false,
      repeat: false,
      resizeMode: 'contain',
      videoOK: true,
      video:null,
      videoLoaded: false,
      videoUploaded:false,
      videoUploading:false,
      videoProgress: 0,
      videoUploadedProgress:0.1,
      videoTotal: 0,
      currentTime: 0,
      duration: 0,
      counting:false,
      recording:false,
    }
  }
  componentDidMount(){
    let user;
    AsyncStorage.getItem('user')
    .then((data) => {
      if (data) {
      user = JSON.parse(data);
        if (user && user.accessToken) {
          this.setState({
            user: user
          })
        }
      }
    })
  }
  _getQiniuToken(){
    let accessToken = this.state.user.accessToken;
    let signatureURL = config.api.base + config.api.signature;
    return request.post(signatureURL,{
          accessToken: accessToken,
          type:'video',
          cloud:'qiniu',
        })
  }
_pickVideo(){
  ImagePicker.showImagePicker(videoOptions, (response) => {
    if (response.didCancel) {
      return
    }
    let uri = response.uri;
    this.setState({
      previewVideo:uri
    })
    this._getQiniuToken()
    .then((data) => {

        if (data && data.success) {
          var token = data.data.token;
          let body = new FormData();
          var key = data.data.key;
          body.append('token',token);
          body.append('key',key);
          body.append('file',{
            type:'video/mp4',
            uri:uri,
            name:key
          });
          this._upload(body);
        }
    })
  });
}
_upload(body){
  this.setState({
    videoUploadedProgress:0,
    videoUploaded: false,
    videoUploading: true
  })
  let xhr = new XMLHttpRequest();
  let url = config.qiniu.upload;
  xhr.open('POST',url);
  xhr.onload = () => {
    if (xhr.status !== 200) {
      AlertIOS.alert('请求失败')
      return
    }
    if (!xhr.responseText) {
      AlertIOS.alert('请求失败')
      return
    }
    let response;
    try {
      response = JSON.parse(xhr.responseText)
      console.log(response);
    } catch (e) {
      console.log(e);
    }

    if (response) {
      this.setState({
        video:response,
        videoUploading: false,
        videoUploaded: true,
      })
      let videoURL = config.api.base + config.api.video;
      let accessToken = this.state.user.accessToken;
      request.post(videoURL,{
        accessToken:accessToken,
        video:response
      })
      .catch((err) => {
        AlertIOS.alert('视频同步出错，请重新上传')
      })
      .then((data) => {
        if (!data || !data.success) {
          AlertIOS.alert('视频同步出错，请重新上传')
        }
      })
    }
  }
  if (xhr.upload) {
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        let percent = Number((event.loaded/event.total).toFixed(2));
        this.setState({
          videoUploadedProgress: percent,
        })
      }
    }
  }
  xhr.send(body)
}

_onProgress(data){
  let duration = data.playableDuration;
  let currentTime = data.currentTime;
  let percent = Number((currentTime/duration).toFixed(2));
if (this.state.recording) {
  this.setState({
    duration: duration,
    currentTime: currentTime,
    videoProgress: percent,
  })
}
}
_onEnd(){
  if (this.state.recording) {
    this.setState({
      videoProgress: 1,
      recording:false
    });
  }
}
_onError(){
  this.setState({videoOK: false});
}
_replay(){
  this.refs.videoPlayer.seek(0)
}
_paused(){
  if (!this.state.paused) {
    this.setState({paused: true})
  }
}
_resume(){
  if (this.state.paused) {
    this.setState({paused: false})
  }
}
_record(){
  this.setState({
    videoProgress:0,
    counting:false,
    recording:true,
  })
this.refs.videoPlayer.seek(0)
}
_counting(){
  if (!this.state.recording && !this.state.counting) {

    this.setState({
      counting:true
    })
    this.refs.videoPlayer.seek(0)
  }
}
_onLoadStart(){}
_onLoad(){}
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>{this.state.previewVideo?'点击按钮配音':'配音开始'}</Text>
          {
            this.state.previewVideo&&this.state.videoUploaded
            ?<Text style={styles.toolbarEdit} onPress={this._pickVideo.bind(this)}>更换视频</Text>
            :null
          }

        </View>
        <View style={styles.page}>
          {
            this.state.previewVideo
            ?<View style={styles.videoContainer}>
            <View style={styles.videoBox}>
              <Video
                ref="videoPlayer"
                source={{uri: this.state.previewVideo}}
                style={styles.video}
                volumn={5}
                paused={this.state.paused}
                rate={this.state.rate}
                muted={this.state.muted}
                resizeMode={this.state.resizeMode}
                repeat={this.state.repeat}
                onLoadStart={this._onLoadStart.bind(this)}
                onLoad={this._onLoad.bind(this)}
                onProgress={this._onProgress.bind(this)}
                onEnd={this._onEnd.bind(this)}
                onError={this._onError.bind(this)}
                />
              {
                !this.state.videoUploaded&&this.state.videoUploading?
                <View style={styles.progressTipBox}>
                  <ProgressViewIOS style={styles.progressBar} progressTintColor='#ee735c' progress={this.state.videoUploadedProgress}/>
                  <Text style={styles.progressTip}>
                    正在生成录音视频，已完成{(this.state.videoUploadedProgress*100).toFixed(2)}%
                  </Text>
                </View>:null
              }
              {
                this.state.recording ?
                <View style={styles.progressTipBox}>
                  <ProgressViewIOS style={styles.progressBar} progressTintColor='#ee735c' progress={this.state.videoProgress}/>
                  <Text style={styles.progressTip}>
                    录制声音中
                  </Text>
                </View>:null
              }
            </View>
            </View>
          :<TouchableOpacity style={styles.uploadContainer} onPress={this._pickVideo.bind(this)}>
          <View style={styles.uploadBox}>
            <Image source={require('../../images/flux.png')} style={styles.uploadIcon}/>
            <Text style={styles.uploadTitle}>点我上传视频</Text>
            <Text style={styles.uploadDesc}>建议时长不超过20秒</Text>
          </View>
          </TouchableOpacity>
          }
          {this.state.videoUploaded?
            <View style={styles.recordBox}>
              <View style={[styles.recordIconBox,this.state.recording && styles.recordOn]}>
                {
                  this.state.counting && !this.state.recording
                  ?   <CountDownText
                        style={styles.countBtn}
                        countType='seconds'
                        auto={true}
                        afterEnd={this._record.bind(this)}
                        timeLeft={3}
                        step={-1}
                        startText='准备录制'
                        endText='go'
                        intervalText={(sec) => {
                          return sec === 0?'Go':sec}}
                      />:
                      <TouchableOpacity onPress={this._counting.bind(this)}>
                        <Icon name='ios-mic' style={styles.recordIcon} />
                      </TouchableOpacity>
                }

              </View>
            </View>:null
          }

        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection:'row',
    paddingTop:25,
    paddingBottom: 12,
    backgroundColor:'#ee735c',
    position:'relative'
  },
  toolbarTitle: {
    flex:1,
    fontSize:16,
    color:'#fff',
    textAlign:'center',
    fontWeight:'600'
  },
  toolbarEdit:{
    position:'absolute',
    right:10,
    top:26,
    color:'#fff',
    textAlign:'right',
    fontWeight:'600',
    fontSize:14
  },
  page:{
    flex:1,
    alignItems:'center',
  },
  uploadContainer:{
    marginTop:90,
    width:width-40,
    paddingBottom:10,
    borderWidth:1,
    borderColor:'#ee735c',
    backgroundColor:'#fff',
    justifyContent:'center',
    borderRadius:6,
  },
  uploadBox:{
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center'
  },
  uploadTitle:{
    textAlign:'center',
    marginBottom:10,
    fontSize:16,
    color:"#000"
  },
  uploadDesc:{
    color:"#999",
    textAlign:'center',

    fontSize:12
  },
  uploadIcon:{
    width:110,
    resizeMode:'contain'
  },
  videoContainer:{
    width:width,
    justifyContent:'center',
    alignItems:'flex-start'
  },
  videoBox:{
    width:width,
    height:height*0.6
  },
  video:{
    width:width,
    height:height*0.6,
    backgroundColor:'#333'
  },
  progressTipBox:{
    position:'absolute',
    left:0,
    bottom:0,
    width:width,
    height:30,
    backgroundColor:'rgba(244,244,244,0.65)',
  },
  progressTip:{
    color:'#333',
    width:width-10,
    padding:5,
  },
  progressBar:{
    width:width
  },
  recordBox:{
    width:width,
    height:60,
    alignItems:'center'
  },
  recordIconBox:{
    width:68,
    height:68,
    marginTop:-30,
    borderRadius:34,
    backgroundColor:'#ee735c',
    borderWidth:1,
    borderColor:'#fff',
    alignItems:'center',
    justifyContent:'center'
  },
  recordOn:{
    backgroundColor:'#ccc'
  },
  recordIcon:{
    fontSize:58,
    color:'#fff',
    backgroundColor:'transparent',
  },
  countBtn:{
    fontSize:32,
    fontWeight:'600',
    color:'#fff'
  },
});
