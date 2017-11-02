
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
  AlertIOS,
  Modal,
  TextInput
} from 'react-native';
import Button from 'react-native-button'
import _ from 'lodash'
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
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import Sound from 'react-native-sound';
import * as Progress from 'react-native-progress';
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
const defaultState = {
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
  audioName:'haoxiong.aac',
  audioPlaying:false,
  recordDone:false,
  audioUploaded:false,
  audioUploading:false,
  audioUploadedProgress:0.14,
  audio:null,
  audioPath:AudioUtils.DocumentDirectoryPath + '/haoxiong.aac',
  videoId:null,
  audioId:null,
  title:'',
  publishProgress:0.2,
  publishing:false,
  willPublish:false,
  modalVisible:false,
  // "react": "16.0.0-alpha.12",
}
export default class Edit extends Component {
  constructor(props){
    super(props);
    let newstate = _.clone(defaultState)
    newstate.user = this.props.user||{}
    this.state = newstate
  }
  _preview(){

    this.setState({
      videoProgress:0,
      audioPlaying:true
    })
    let audioPath = this.state.audioPath

    if (/^http/.test(audioPath)) {
      var sound = new Sound(audioPath,  (error) => {
        if (error) {
          console.log('failed to load the sound', error);
        }
      });
    }else{

      var sound = new Sound(audioPath, '', (error) => {

        if (error) {
          console.log('failed to load the sound', error);
        }
      });

    }

    if (this.state.audioPlaying) {
      this.setState({
        audioPlaying:false
      })
      sound.stop(() => {

      })
    }
    setTimeout(() => {
      sound.play((success) => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
          sound.release();
        });
    },100)
    this.refs.videoPlayer.seek(0)
  }
  _uploadAudio(){
    let tags = 'app,audio';
    let folder = 'audio';
    let timestamp = Date.now();
    this._getToken({
      type:'audio',
      timestamp:timestamp,
      cloud:'cloudinary'
    })
    .catch((err) => {
      console.log(err);
    })
    .then((data) => {
      if (data && data.success) {
          let signature = data.data.token;
          let key = data.data.key;
          let body = new FormData();
          body.append('folder',folder);
          body.append('signature',signature);
          body.append('tags',tags);
          body.append('timestamp',timestamp);
          body.append('api_key',config.cloudinary.api_key);
          body.append('resource_type','video');
          body.append('file',{
            type:'video/mp4',
            name:key,
            uri:this.state.audioPath,
          });
          this._upload(body,'audio');
        }
    })
  }
  _initAudio(){
    let audioPath = this.state.audioPath
    AudioRecorder.prepareRecordingAtPath(audioPath, {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: "High",
        AudioEncoding: "aac",
        // AudioEncodingBitRate: 32000
      });
      AudioRecorder.onProgress = (data) => {
        this.setState({currentTime: Math.floor(data.currentTime)});
      };

      // AudioRecorder.onFinished = (data) => {
      //   // Android callback comes in the form of a promise instead.
      //   if (Platform.OS === 'ios') {
      //     this._finishRecording(data.status === "OK", data.audioFileURL);
      //   }
      // };
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
    this._initAudio()
  }

  _getToken(body){
    body.accessToken = this.state.user.accessToken;
    let signatureURL = config.api.base + config.api.signature;
    return request.post(signatureURL,body)
  }
_pickVideo(){
  ImagePicker.showImagePicker(videoOptions, (response) => {
    if (response.didCancel) {
      return
    }
    let uri = response.uri;
    let state = _.clone(defaultState)
    state.previewVideo = uri
    state.user = this.state.user
    this.setState(
      state
    )
    this._getToken({
      type:'video',
      cloud:'qiniu'
    })
    .catch((err) => {
      AlertIOS.alert('上传出错')
    })
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
          this._upload(body,'video');
        }
    })
  });
}
_upload(body,type){

  let xhr = new XMLHttpRequest();
  let url = config.qiniu.upload;
  if (type === 'audio') {
    url = config.cloudinary.video
  }
  let state = {}
  state[type + 'UploadedProgress'] = 0
  state[type + 'Uploaded'] = false
  state[type + 'Uploading'] = true
  this.setState(state)
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
      // console.log(response);
    } catch (e) {
      console.log(e);
    }

    if (response) {
      let newstate = {}
      newstate[type] = response
      newstate[type + 'Uploading'] = false
      newstate[type + 'Uploaded'] = true
      this.setState(newstate)

        let updateURL = config.api.base + config.api[type];
        let accessToken = this.state.user.accessToken;
        let updateBody = {
          accessToken: accessToken
        }
        updateBody[type] = response
        if (type === 'audio') {
          updateBody.videoId = this.state.videoId
        }
        request.post(updateURL,updateBody)
        .catch((err) => {
          if (type === 'video') {
            AlertIOS.alert('视频同步出错，请重新上传')
          }else if (type === 'audio') {
            AlertIOS.alert('Yin频同步出错，请重新上传')
          }
        })
        .then((data) => {

          if (data && data.success) {
            let mediaState = {}
            mediaState[type + 'Id'] = data.data
            if (type === 'audio') {
              this._showModal()
              mediaState.willPublish = true
            }
            this.setState(mediaState)
          }else{
            if (type === 'video') {
              AlertIOS.alert('视频同步出错，请重新上传')
            }else if (type === 'audio') {
              AlertIOS.alert('Yin频同步出错，请重新上传')
            }
          }
        })

    }
  }
  if (xhr.upload) {
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        let percent = Number((event.loaded/event.total).toFixed(2));
        this.setState({publishProgress:percent})
        let progressState = {}
        progressState[type + 'UploadedProgress'] = percent
        this.setState(progressState)
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
    AudioRecorder.stopRecording()
    this.setState({
      recordDone:true,
      videoProgress: 1,
      recording:false,
      audioPlaying:false
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
    recordDone:false
  })
  AudioRecorder.startRecording()
  this.refs.videoPlayer.seek(0)
}
_counting(){
  if (!this.state.recording && !this.state.counting && !this.state.audioPlaying) {

    this.setState({
      counting:true
    })
    this.refs.videoPlayer.seek(0)
  }
}
_onLoadStart(){}
_onLoad(){}
_closeModal(){
  
  this.setState({modalVisible:false,audioUploading:false,audioUploaded:false})
}
_showModal(){
  this.setState({modalVisible:true})
}
_submit(){
  let body = {
    title:this.state.title,
    videoId:this.state.videoId,
    audioId:this.state.audioId
  }
  let creationURL = config.api.base + config.api.creations
  let user = this.state.user
  if (user && user.accessToken) {
    body.accessToken = user.accessToken
    this.setState({publishing:true})
    request.post(creationURL,body)
      .then((data) => {
        // console.log(data)
        if (data && data.success) {
          // this._closeModal();   
          
          // AlertIOS.alert('视频发布成功')
          let state = _.clone(defaultState)
          this.setState(state) 
          
          
        }else{
          this.setState({publishing:false})
          AlertIOS.alert('视频发布失败')
        }
      })
  }
}
  render() {
    // console.log(this.state.audioPlaying);
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
                this.state.recording || this.state.audioPlaying?
                <View style={styles.progressTipBox}>
                  <ProgressViewIOS style={styles.progressBar} progressTintColor='#ee735c' progress={this.state.videoProgress}/>
                  {
                    this.state.recording?
                    <Text style={styles.progressTip}>
                      录制声音中
                    </Text>:null
                  }
                </View>:null
              }
              {
                this.state.recordDone?
                <View style={styles.previewBox}>
                  <Icon name='ios-play' style={styles.previewIcon}/>
                  <Text style={styles.previewText} onPress={this._preview.bind(this)}>预览</Text>
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
              <View style={[styles.recordIconBox,(this.state.recording || this.state.audioPlaying)&& styles.recordOn]}>
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
          {
            this.state.videoUploaded && this.state.recordDone
            ?<View style={styles.uploadAudioBox}>
            {
              !this.state.audioUploaded && !this.state.audioUploading
              ?<Text style={styles.uploadAudioText} onPress={this._uploadAudio.bind(this)}>下一步</Text>
              :null
            }
            {
              this.state.audioUploading?
              <Progress.Circle size={70} showsText={true} color={'#ee735c'} progress={this.state.audioUploadedProgress}/>
              :null
            }

          </View>
          :null
          }
        </View>

          <Modal
            animationType={'fade'} visible={this.state.modalVisible}>
            <View style={styles.modalContainer}>
              <Icon name="ios-close-outline" style={styles.closeIcon}
                onPress={this._closeModal.bind(this)}/>
              {
                this.state.audioUploaded && !this.state.publishing
                ?<View style={styles.fieldBox}>
                  <TextInput
                    placeholder={'给好好一句宣言吧'}
                    style={styles.inputfield}
                    autoCorrect={false}
                    autoCapitalize={'none'}
                    defaultValue={this.state.title}
                    onChangeText={(text) => {
                      this.setState({
                        title:text
                      })
                    }}
                     />
                 </View>:null
              }
              {
                this.state.publishing
                ?<View style={styles.loadingBox}>

                  <Text style={styles.loadingText}>耐心等一下，拼命为您生成专属视频中...</Text>
                {
                  this.state.willPublish
                  ?<Text style={styles.loadingText}>正在合成视频音频...</Text>:null
                }
                {
                  this.state.publishProgress > 0.3
                  ?<Text style={styles.loadingText}>开始上传喽...</Text>:null
                }
                  {/* <Progress.Circle size={70} showsText={true} color={'#ee735c'} progress={this.state.publishProgress}/> */}
                  </View> :null
              }

              <View style={styles.submitBox}>
                {
                  this.state.audioUploaded && !this.state.publishing
                ?<Button style={styles.btn} onPress={this._submit.bind(this)}>发布视频</Button>:null
              }

              </View>
            </View>
          </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  uploadAudioBox:{
    width:width,
    height:60,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'
  },
  uploadAudioText:{
    width:width -20,
    padding:5,
    borderWidth:1,
    borderColor:'#ee735c',
    borderRadius:5,
    textAlign:'center',
    fontSize:30,
    color:'#ee735c'
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
  previewBox:{
    width:80,
    height:30,
    position:'absolute',
    right:10,
    bottom:10,
    borderWidth:1,
    borderColor:'#ee735c',
    borderRadius:3,
    backgroundColor:'transparent',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'
  },
  previewIcon:{
    marginRight:5,
    fontSize:20,
    color:'#ee735c',
    backgroundColor:'transparent'
  },
  previewText:{
    fontSize:20,
    color:'#ee735c'
  },
  modalContainer: {
    width:width,
    height:height,
    paddingTop:50,
    backgroundColor:'#fff',
    // position:'relative'
  },
  submitBox:{
    marginTop:50,
    padding:15,
  },
  closeIcon: {
    position:'absolute',
    height:40,
    width:40,
    fontSize:32,
    right:20,
    top:30,
    color:'#ee735c'
  },
  inputField:{
    flex:1,
    height:36,
    color:'#666',
    fontSize:14,

  },
  btn: {
    padding: 10,
    marginTop:65,
    marginRight:10,
    marginLeft:10,
    borderRadius:4,
    borderColor:'#ee735c',
    borderWidth:1,
    backgroundColor:'transparent',
    color:'#ee735c'
  },
  loadingText:{
    color:'#333',
    marginBottom:10,
    textAlign:'center'
  },
  loadingBox:{
    width:width,
    height:50,
    marginTop:10,
    padding:15,
    alignItems:'center'
  },
  fieldBox:{
    width:width-40,
    height:36,
    marginTop:30,
    marginLeft:20,
    marginRight:20,
    borderBottomWidth:1,
    borderBottomColor:'#eaeaea'
  },
});
