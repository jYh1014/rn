
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ListView,
  TextInput,
  Modal,
  AsyncStorage,
  AlertIOS
} from 'react-native';
import Button from 'react-native-button'
import  Video  from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons'
import request from '../common/request'
import config from '../common/config'
const width = Dimensions.get('window').width;
const cachedResults = {
  nextPage: 1,
  items: [],
  total: 0
};

export default class Detail extends Component {
  constructor(props){
    super(props);
    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    
    this.state = {
      rate: 1,
      muted: false,
      resizeMode: 'contain',
      repeat: false,
      videoLoaded: false,
      videoProgress: 0.01,
      videoTotal: 0,
      currentTime: 0,
      duration: 0,
      playing: false,
      paused: false,
      videoOK: true,
      dataSource: ds.cloneWithRows([]),
      isLoadingTail: false,
      animationType: 'none',
      modalVisible:false,
      isSending:false,
      content:'',
      user:this.props.user,
      data:this.props.data
    }
  }
  _backToList(){
    this.props.navigator.pop();
  }
  _onLoadStart(){

  }
  _onLoad(){

  }
  _onProgress(data){
    let duration = data.playableDuration;
    let currentTime = data.currentTime;
    let percent = Number((currentTime/duration).toFixed(2));
    let newState = {
      duration: duration,
      currentTime: currentTime,
      videoProgress: percent
    };
    if (currentTime > duration) {
      return
    }
    if (!this.state.videoLoaded) {
      this.setState({videoLoaded:true})
    }
    if (!this.state.playing) {
      this.setState({playing:true})
    }
    this.setState({
      duration: duration,
      currentTime: currentTime,
      videoProgress: percent
    })
    // if (!this.state.videoLoaded) {
    //   newState.videoLoaded = true;
    // }
    // if (!this.state.playing) {
    //   newState.playing = true;
    // }
    // this.setState(newState);
  }
  _onEnd(){
    this.setState({
      videoProgress: 1,
      playing: false
    });

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
  componentDidMount(){ 
    this._fetchData(1);      
  }

  _fetchData(page) {
    console.log(this.state.user)
    this.setState({isLoadingTail: true});
    request.get(config.api.base + config.api.comment, {
      accessToken: this.state.user.accessToken,
      creation: this.props.data._id,
      
    })
    .then((data) => {
      console.log(data)
      if (data.success) {
        let items = cachedResults.items.slice();
        items = items.concat(data.data);
        cachedResults.nextPage += 1;
        cachedResults.items = items;
        cachedResults.total = data.total;
        this.setState({
          isLoadingTail: false,
          dataSource: this.state.dataSource.cloneWithRows(cachedResults.items)
        })
      }
    })
    .catch((error) => {
      this.setState({isLoadingTail: false})
      console.warn(error)
    })
  }
  _hasMore(){
    return cachedResults.items.length !== cachedResults.total
  }

  _fetchMoreData(){
    if (!this._hasMore()||this.state.isLoadingTail) {
      return
    }
    let page = cachedResults.nextPage;
    this._fetchData(page);
  }

  _renderFooter(){
    if(!this._hasMore() && cachedResults.total !== 0){
      return (
        <View style = {styles.loadingMore}>
          <Text style = {styles.loadingText}>没有更多了</Text>
        </View>
      )
    }
    if (!this.state.isLoadingTail) {
      return <View style = {styles.loadingMore}></View>
    }
    return (
      <ActivityIndicator style = {styles.loadingMore}/>
    )
  }

  _renderRow(row){
    console.log(row)
    
    return (
        <View style={styles.replyBox} key={row._id}>
          <Image style={styles.replyAvatar} source={{uri:'http://owthc2jo8.bkt.clouddn.com/'+row.replyBy.avatar}}/>
          <View style={styles.reply}>
            <Text style={styles.replyNickName}>{row.replyBy.nickName}</Text>
            <Text style={styles.replyContent}>{row.content}</Text>
          </View>
        </View>
    )
  }
  _renderHeader(){
    let data = this.props.data;
    
    return (
      <View>
        <View style={styles.infoBox}>
          <Image style={styles.avatar} source={{uri:'http://owthc2jo8.bkt.clouddn.com/'+this.state.user.avatar}}/>
          <View style={styles.descBox}>
            <Text style={styles.nickName}>{data.nickName}</Text>
            <Text style={styles.title}>{data.title}</Text>
          </View>
        </View>
        <View style={styles.commentBox}>
          <View style={styles.comment}>
            <TextInput
              style={styles.content}
              placeholder="敢不敢评论一个..."
              multiline={true}
              onFocus={this._focus.bind(this)}
              />
          </View>
        </View>
        <View style={styles.commentArea}>
          <Text style={styles.commentTitle}>精彩评论</Text>
        </View>
      </View>
    )
  }
  _focus(){
    this._setModalVisible(true);
  }

  _closeModal(){
    this._setModalVisible(false);
  }
  _setModalVisible(isVisible){
    this.setState({modalVisible:isVisible})
  }
  _submit(){
    if (!this.state.content) {
      return AlertIOS.alert('评论不能为空')
    }
    if (this.state.isSending) {
      return AlertIOS.alert('正在评论中...')
    }
    this.setState({
      isSending:true
    },() => {
    //   let body ={
    //     accessToken:this.state.user.accessToken,
    //     creation:this.state.data._id,
    //     content:this.state.content
    //   };
    let body = {
        accessToken:this.state.user.accessToken,
        comment:{
            creation:this.state.data._id,
            content:this.state.content
        }
    }
      let url = config.api.base + config.api.comment;
      request.post(url,body).then((data) => {
        console.log(data)
        if (data && data.success) {
          let items = cachedResults.items.slice();
          items = [{
            content:this.state.content,
            replyBy:{
              nickName:'狗狗',
              avatar:'http://dummyimage.com/640x640/1f8523)'
            }
          }].concat(items);
          cachedResults.items = items;
          cachedResults.total = cachedResults.total + 1;
          this.setState({
            isSending:false,
            dataSource:this.state.dataSource.cloneWithRows(cachedResults.items)
          });
          this._setModalVisible(false);
        }
      }).catch((err) => {

        this.setState({isSending:false});
        this._setModalVisible(false);
        AlertIOS.alert('评论失败，稍后重试')
      })
    })
  }
  render() {
    
    const {data} =  this.props;
    
    return (
      <View style={styles.container}>
        <View style={styles.videoBox}>
        
          {
            !this.state.videoOK && <Text style={styles.failText}>视频出错了 很抱歉...</Text>
          }
          {
            !this.state.videoLoaded?<ActivityIndicator color="#ee735c" style={styles.loading}/>:null
          }
          {
            this.state.videoLoaded && !this.state.playing
            ?<Icon
            name="ios-play"
            onPress={this._replay.bind(this)}
            style={styles.playIcon}
            size = {30}
            />:null
          }
          <View style={styles.progressBox}>
            <View style={[styles.progressBar,{width: width*this.state.videoProgress}]}></View>
          </View>
          {
            this.state.videoLoaded && this.state.playing
            ?<TouchableOpacity onPress={this._paused.bind(this)} style={styles.pauseBtn}>
            {
              this.state.paused?
              <Icon name="ios-play" onPress={this._resume.bind(this)} style={styles.resumeIcon} size={30}/>
              :<Text></Text>
            }
            </TouchableOpacity>
            :null
          }
        </View>
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this._renderRow.bind(this)}
            enableEmptySections = {true}
            showsVerticalScrollIndicator = {false}
            automaticallyAdjustContentInsets = {false}
            onEndReachedThreshold = {20}
            onEndReached = {this._fetchMoreData.bind(this)}
            renderFooter = {this._renderFooter.bind(this)}
            renderHeader = {this._renderHeader.bind(this)}
          />
          <Modal
          animationType={'fade'}
          visible={this.state.modalVisible}
          onRequestClose={this._setModalVisible.bind(this,false)}>
          <View style={styles.modalContainer}>
            <Icon name="ios-close-outline"
              style={styles.closeIcon}
              onPress={this._closeModal.bind(this)}/>
              <View style={styles.commentBox}>
                <View style={styles.comment}>
                  <TextInput
                    style={styles.content}
                    placeholder="敢不敢评论一个..."
                    multiline={true}
                    onFocus={this._focus.bind(this)}
                    defaultValue={this.state.content}
                    onChangeText={(text) => {
                      this.setState({content:text})
                    }}
                    />
                </View>
              </View>
              <Button style={styles.submitBtn} onPress={this._submit.bind(this)}>评论</Button>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#F5FCFF',
    paddingTop: 65
  },
  modalContainer: {
    flex:1,
    paddingTop:45,
    backgroundColor:'#fff'
  },
  closeIcon: {
    alignSelf:'center',
    fontSize:30,
    color: '#ee753c'
  },
  videoBox: {
    width: width,
    height: width*0.56,
    backgroundColor: '#000'
  },
  video: {
    width: width,
    height: width*0.56,
    backgroundColor: '#000'
  },
  loading: {
    position: 'absolute',
    left: 0,
    top: 80,
    width: width,
    alignSelf: 'center',
    backgroundColor: 'transparent'
  },
  playIcon: {
    position: 'absolute',
    top: 80,
    left: width/2 - 20,
    paddingTop: 9,
    paddingLeft: 18,
    width: 46,
    height: 46,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 22,
    color: '#ed7b66'
  },
  pauseBtn: {
    position:'absolute',
    left: 0,
    top: 0,
    height:width*0.56,
    width:width,
    backgroundColor: 'transparent',
  },
  resumeIcon: {
    position: 'absolute',
    top: 80,
    left: width/2 - 20,
    paddingTop: 9,
    paddingLeft: 18,
    width: 46,
    height: 46,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1.5,
    borderRadius: 22,
    color: '#ed7b66'
  },
  failText: {
    position: 'absolute',
    left: 0,
    top: 110,
    width: width,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    color: '#fff',
    textAlign: 'center'
  },
  infoBox: {
    width: width,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10
  },
  avatar: {
    width:60,
    height:60,
    marginRight:10,
    marginLeft:10,
    borderRadius: 30
  },
  descBox: {
    flex:1
  },
  nickName: {
    fontSize: 18,
  },
  title: {
    fontSize: 16,
    marginTop: 8,
    color: '#666'
  },
  replyBox: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10
  },
  replyAvatar: {
    width:40,
    height:40,
    marginRight:10,
    marginLeft:10,
    borderRadius:20
  },
  replyNickName: {
    color:'#666'
  },
  replyContent: {
    color:'#666',
    marginTop:4
  },
  reply: {
    flex: 1
  },
  loadingMore: {
    marginVertical: 20
  },
  loadingText: {
    color: '#777',
    textAlign: 'center'
  },
  listHeader: {
      marginTop:10,
      width:width
  },
  commentBox: {
    marginTop:10,
    marginBottom:10,
    padding:8,
    width:width
  },
  content: {
    paddingLeft:2,
    color:'#333',
    borderWidth:1,
    borderColor:'#ddd',
    borderRadius:4,
    fontSize:14,
    height:80
  },
  commentArea: {
    paddingBottom: 6,
    width:width,
    paddingLeft:10,
    paddingRight:10,
    // marginTop:10,
    borderBottomWidth:1,
    borderBottomColor:'#eee'
  },
  submitBtn:{
    width:width-20,
    padding:16,
    marginTop:20,
    marginBottom:20,
    borderWidth:1,
    borderColor:'#ee653c',
    borderRadius:4,
    fontSize:18,
    color:'#ee753c',
    alignSelf:'center'
  },
  progressBox: {
    width:width,
    height:2,
    backgroundColor:'#ccc'
  },
  progressBar: {
    width:1,
    height:2,
    backgroundColor:'#ff6600'
  }

});
