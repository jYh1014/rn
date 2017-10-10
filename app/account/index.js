
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
  AlertIOS,
  Modal,
  TextInput,

} from 'react-native';
import Button from 'react-native-button'
import * as Progress from 'react-native-progress';
import request from '../common/request'
import config from '../common/config'
import sha1 from 'sha1'
const ImagePicker = require('react-native-image-picker')
import Icon from 'react-native-vector-icons/Ionicons'
const width = Dimensions.get('window').width;
var uuid = require('uuid')
const photoOptions = {
  title: '选择头像',
  cancelButtonTitle: '取消',
  takePhotoButtonTitle: '拍照',
  chooseFromLibraryButtonTitle: '选择相册',
  quality: 0.75,
  allowsEditing:true,
  noData: false,
  customButtons: {
    'Choose Photo from Facebook': 'fb',
  },
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

export default class Account extends Component {
  constructor(props){
    super(props);
    this.state={
      user: this.props.user,
      avatarProgress: 0,
      avatarUploading: false,
      modalVisible:false,
    }
    this._getavatar = this._getavatar.bind(this)
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
  _edit(){
    this.setState({
      modalVisible:true
    })
  }
  _closeModal(){
    this.setState({
      modalVisible:false
    })
  }
  _getavatar(id,type){

    if (id.indexOf('http')>-1) {
      return id
    }
    if (id.indexOf('data:image')>-1) {
      return id
    }
    if (id.indexOf('avatar/')>-1) {
      return config.cloudinary.base + './' +type+'/upload/'+id
    }
    return 'http://owthc2jo8.bkt.clouddn.com/'+id
  }
  _getQiniuToken(){
    let accessToken = this.state.user.accessToken;
    let signatureURL = config.api.base + config.api.signature;
    return    request.post(signatureURL,{
            accessToken: accessToken,
            type:'avatar',
            cloud:'qiniu',
          })
          // .then((data) => {
          //   console.log(data);
          //   if (data && data.success) {
          //     var signature = data.data;
          //     let body = new FormData();
          //     body.append('folder',folder);
          //     body.append('signature',signature);
          //     body.append('tags',tags);
          //     body.append('timestamp',timestamp);
          //     body.append('api_key',CLOUDINARY.api_key);
          //     body.append('resource_type','image');
          //     body.append('file',avatarData);
          //     this._upload(body);
          //   }
          // })
  }
  _pickPhoto(){

    ImagePicker.showImagePicker(photoOptions, (response) => {
      if (response.didCancel) {
        return
      }
      let avatarData = 'data:image/jpeg;base64,' + response.data;
      // let timestamp = Date.now();
      // let tags = 'app,avatar';
      // let folder = 'avatar';
      let uri = response.uri;
      let accessToken = this.state.user.accessToken;
      // let key = uuid.v4()+'.jpeg';
      this._getQiniuToken()
      .then((data) => {
          if (data && data.success) {
            var token = data.data.token;
            let body = new FormData();
            var key = data.data.key;
            // body.append('folder',folder);
            // body.append('signature',signature);
            // body.append('tags',tags);
            // body.append('timestamp',timestamp);
            body.append('token',token);
            body.append('key',key);
            // body.append('api_key',CLOUDINARY.api_key);
            // body.append('resource_type','image');
            body.append('file',{
              type:'image/jpeg',
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
      avatarProgress: 0,
      avatarUploading: true
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
        // console.log(response);
      } catch (e) {
        // console.log(e);
      }

      // if (response && response.public_id) {
      //
      //   user.avatar = response.public_id;
      //   this.setState({
      //     avatarProgress: 0,
      //     avatarUploading: false,
      //     user: user,
      //   })
      //   this._asyncUser(true);
      // }
      if (response) {
        let user = this.state.user;
        if (response.public_id) {
          user.avatar = response.public_id;
        }
        if (response.key) {
          user.avatar = response.key;
        }
        this.setState({
          avatarProgress: 0,
          avatarUploading: false,
          user: user,
        })
        this._asyncUser(true);
      }
    }
    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          let percent = Number((event.loaded/event.total).toFixed(2));
          this.setState({
            avatarProgress: percent,
          })
        }
      }
    }
    xhr.send(body)
  }
  _asyncUser(isAvatar){
    let user = this.state.user;
    if (user && user.accessToken) {
      let url = config.api.base + config.api.update;

      request.post(url,user)
      .then((data) => {
        // console.log(data);
        if (data && data.success) {
          if (isAvatar) {
              AlertIOS.alert('头像更新成功')
          }
          let user = data.data;
          this.setState({user:user},() => {
            this._closeModal();
            AsyncStorage.setItem('user',JSON.stringify(user));
          })
        }
      })
    }
  }
  _changeUserState(key,value){
    let user = this.state.user;
    user[key] = value;
    this.setState({
      user: user
    })
  }
  _submit(){
    this._asyncUser(false)
  }
  _logout(){
    this.props.logout()
  }
  render() {
    const user = this.state.user;
    // console.log(user);
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>我的账户</Text>
          <Text style={styles.toolbarEdit} onPress={this._edit.bind(this)}>编辑</Text>
        </View>
        {
          user.avatar
          ?<TouchableOpacity onPress={this._pickPhoto.bind(this)}
           style={styles.avatarContainer}>
            <Image source={{uri:this._getavatar(user.avatar,'image')}} style={styles.avatarContainer} />
              <View style={[styles.avatarBox,styles.avatarBox1]}>
                {
                  this.state.avatarUploading
                  ?<Progress.Circle size={70} showsText={true} color={'#ee735c'} progress={this.state.avatarProgress}/>
                :<Image source={{uri:this._getavatar(user.avatar,'image')}} style={styles.avatar}/>
                }
              </View>
              <Text style={styles.avatarTip}>戳这里换头像</Text>
          </TouchableOpacity>
          :<View style={styles.avatarContainer}>
            <Text style={styles.avatarTip}>添加头像</Text>
            <TouchableOpacity style={[styles.avatarBox,styles.avatarBox2]} onPress={this._pickPhoto.bind(this)}>
              {
                this.state.avatarUploading
                ?<Progress.Circle size={70} showsText={true} color={'#ee735c'} progress={this.state.avatarProgress}/>
                :<Icon name='ios-cloud-upload-outline' style={styles.plusIcon} size={30}/>
              }
            </TouchableOpacity>
          </View>
        }
        <Modal
          animationType={'fade'} visible={this.state.modalVisible}>
          <View style={styles.modalContainer}>
            <Icon name="ios-close-outline" style={styles.closeIcon}
              onPress={this._closeModal.bind(this)}/>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>昵称</Text>
              <TextInput placeholder={'输入你的昵称'}   style={styles.inputField}
                clearTextOnFocus={true}
                autoCorrect={false}
               defaultValue={user.nickName}
               onChangeText={(text) => {
                 this._changeUserState('nickName',text)
               }} />
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>品种</Text>
              <TextInput placeholder={'狗狗的品种'}   style={styles.inputField}
                autoCapitalize={'none'}
                autoCorrect={false}
                defaultValue={user.breed}
               onChangeText={(text) => {
                 this._changeUserState('breed',text)
               }} />
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>年龄</Text>
              <TextInput placeholder={'狗狗的年龄'}   style={styles.inputField}
                autoCapitalize={'none'}
                autoCorrect={false}
                defaultValue={user.age}
               onChangeText={(text) => {
                 this._changeUserState('age',text)
               }} />
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>性别</Text>
              <Icon.Button onPress={() => {
                  this._changeUserState('gender','male')
                }}
                style={[styles.gender,user.gender === 'male'&&styles.genderChecked]} name="ios-man">
                男
              </Icon.Button>
              <Icon.Button onPress={() => {
                  this._changeUserState('gender','female')
                }}
                style={[styles.gender,user.gender === 'female'&&styles.genderChecked]} name="ios-woman">
                女
              </Icon.Button>
            </View>
            <Button style={styles.btn} onPress={this._submit.bind(this)}>保存</Button>
          </View>
        </Modal>
        <Button style={styles.btn} onPress={this._logout.bind(this)}>退出登录</Button>
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
    backgroundColor:'#ee735c'
  },
  toolbarTitle: {
    flex:1,
    fontSize:16,
    color:'#fff',
    textAlign:'center',
    fontWeight:'600'
  },
  avatarContainer: {
    width:width,
    height:140,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#ccc'
  },
  avatarBox: {
    marginTop:15,
    alignItems:'center',
    justifyContent:'center',
    // backgroundColor:'#fff',
    // borderRadius:5,
    // borderWidth:1,
    padding:2,
    backgroundColor:'transparent'
  },
  avatarBox2: {
    // backgroundColor:'transparent'
  },
  avatarBox1: {
    position: 'absolute',
    backgroundColor:'transparent',
    // borderColor:'#fff',
    borderWidth:0
  },
  avatarTip: {
    position: 'absolute',
    top:120,
    backgroundColor:'transparent',
    fontSize:14,
    color:'#fff',
    // borderColor:'#fff'
  },
  avatar: {
    width:width*0.2,
    height:width*0.2,
    marginBottom:15,
    resizeMode:'cover',
    borderRadius:width*0.1,
    borderColor:'#ededed',
    borderWidth:1
  },
  plusIcon: {
    padding:20,
    paddingLeft:25,
    paddingRight:25,
    color:'#999',
    fontSize:24,
    // backgroundColor:'#fff',
    borderWidth:1,
    borderColor:'#fff',
    borderRadius:5,
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
  modalContainer: {
    flex:1,
    paddingTop:50,
    backgroundColor:'#fff'
  },
  fieldItem:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    height:50,
    paddingLeft:15,
    paddingRight:15,
    borderColor:'#eee',
    borderBottomWidth:1,
  },
  label:{
    color:'#ccc',
    marginRight:10,
  },
  inputField:{
    flex:1,
    height:50,
    color:'#666',
    fontSize:14,
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
  gender:{
    backgroundColor:'#ccc'
  },
  genderChecked:{
    backgroundColor:'#ee735c'
  },
  btn: {
    padding: 10,
    marginTop:25,
    marginRight:10,
    marginLeft:10,
    borderRadius:4,
    borderColor:'#ee735c',
    borderWidth:1,
    backgroundColor:'transparent',
    color:'#ee735c'
  },
});
