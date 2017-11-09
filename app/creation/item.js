
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
  Dimensions,
  AlertIOS,
} from 'react-native';
// import PropTypes from 'prop-types'
import request from '../common/request'
import config from '../common/config'
import Icon from 'react-native-vector-icons/Ionicons'
const width = Dimensions.get('window').width;
export default class Item extends Component {
  constructor(props){
    super(props);
    this.state = {
      up: this.props.row.voted,
    }
  }
  _up(){
    let up = !this.state.up;
    let row = this.props.row;
    let user = this.props.user
    let url = config.api.base + config.api.up;
    let body = {
      id: row._id,
      up: up?"true":"false",
      accessToken: user.accessToken
    };
    
    request.post(url,body)
    .then((data) => {
      if (data && data.success) {
        this.setState({up: up});
      }else{
        AlertIOS.alert('点赞失败，稍后重试');
      }
    })
    .catch((err) => {
      AlertIOS.alert('点赞失败，稍后重试');
    })
  }

  render() {
    const { row } = this.props;
    // console.log(row)
    return (
      <TouchableHighlight onPress = {this.props.onSelect}>
        <View style={styles.item}>
          <Text style={styles.title}>{row.title}</Text>
          <Image source={{uri:row.cloudinary_thumb}} style={styles.thumb} />
            {/* <Icon name="ios-play" size={28} style={styles.play}/> */}
          <View style={styles.itemFooter}>
            <View style={styles.handleBox}>
              <Icon name={this.state.up?"ios-heart":"ios-heart-outline"} size={28} onPress = {this._up.bind(this)} style={[styles.up,this.state.up?null:styles.down]}/>
              <Text style={styles.handleText} onPress = {this._up.bind(this)}>喜欢</Text>
            </View>
            <View style={styles.handleBox}>
              <Icon name="ios-chatboxes-outline" size={28} style={styles.commentIcon}/>
              <Text style={styles.handleText}>评论</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  header: {
    paddingTop: 25,
    paddingBottom: 12,
    backgroundColor: '#ee735c'
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600'
  },
  item: {
    width: width,
    marginBottom: 10,
    backgroundColor: '#fff',
    position: 'relative'
  },
  thumb: {
    width: width,
    height: width*0.56,
    resizeMode: 'cover',
  },
  title: {
    padding: 10,
    fontSize: 18,
    color: '#333'
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#eee'
  },
  handleBox: {
    flexDirection: 'row',
    width: width*0.5-0.5,
    padding: 10,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  play: {
    position: 'absolute',
    bottom: 55,
    right: 15,
    paddingTop: 9,
    paddingLeft: 18,
    width: 46,
    height: 46,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 23,
    color: '#ed7b66'
  },
  handleText: {
    fontSize:18,
    paddingLeft: 12,
    color: '#333'
  },
  down: {
    color: '#333',
    fontSize: 22,
  },
  up: {
    color: '#ed7b66',
    fontSize: 22,
  },
  commentIcon: {
    color: '#333',
    fontSize: 22
  },

});
