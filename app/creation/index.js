
import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons'
import request from '../common/request'
import config from '../common/config'
import Item from './item'
import Detail from './detail'
import Test from './Test'
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ListView,
  TouchableHighlight,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  AsyncStorage
} from 'react-native';
// import PropTypes from 'prop-types'
// import { Navigator } from 'react-native-deprecated-custom-components'
const width = Dimensions.get('window').width;
const cachedResults = {
  nextPage: 1,
  items: [],
  total: 0
};

export default class List extends Component {
  constructor(props){
    super(props);
    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([]),
      isLoadingTail: false,
      isRefreshing: false
    }
  }
  componentDidMount(){
    
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
    setTimeout(() => {
      this._fetchData(1);
    },1)
    
  }
  _fetchData(page) {
    if (page !== 0) {
      this.setState({isLoadingTail: true});
    }else{
      this.setState({isRefreshing: true});
    }

    request.get(config.api.base + config.api.creations, {
      page: page,
      accessToken:this.state.user.accessToken
    })
    .then((data) => {
      
      if (data.success) {
        let items = cachedResults.items.slice();
        if (page !== 0) {
          items = items.concat(data.data);
          cachedResults.nextPage += 1;
        }else{
          items = data.data.concat(items);
        }
        cachedResults.items = items;
        cachedResults.total = data.total;

          if (page !== 0) {
            this.setState({
              isLoadingTail: false,
              dataSource: this.state.dataSource.cloneWithRows(cachedResults.items)
            })
          }else{
            this.setState({
              isRefreshing: false,
              dataSource: this.state.dataSource.cloneWithRows(cachedResults.items)
            })
          }

      }
    })
    .catch((error) => {
      if (page !== 0) {
        this.setState({isLoadingTail: false})
      }else{
        this.setState({isRefreshing: false})
      }
      console.warn(error)
    })
  }

  _renderRow(row){
    // console.log(row)
    return (
      <Item row = {row} user = {this.state.user} onSelect = {() => this._loadPage(row)} key = {row._id}/>
    )
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

  _onRefresh(){
    if (this.state.isRefreshing || !this._hasMore()) {
      return
    }

    this._fetchData(0);
  }
  _loadPage(row){
   
    this.props.navigator.push({
      component: Detail,
      title: '视频详情',
      passProps: {
        data: row,
        user:this.state.user
      }
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle} >
            列表页面
          </Text>
        </View>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this._renderRow.bind(this)}
          enableEmptySections = {true}
          showsVerticalScrollIndicator = {false}
          automaticallyAdjustContentInsets = {false}
          onEndReached = {this._fetchMoreData.bind(this)}
          onEndReachedThreshold = {20}
          renderFooter = {this._renderFooter.bind(this)}
          refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={this._onRefresh.bind(this)}
            tintColor="#ff6600"
            title="拼命加载中..."
            progressBackgroundColor="#ffff00"
          />
        }
        />
      </View>
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
  up: {
    color: '#333',
    fontSize: 22,
  },
  commentIcon: {
    color: '#333',
    fontSize: 22
  },
  loadingMore: {
    marginVertical: 20
  },
  loadingText: {
    color: '#777',
    textAlign: 'center'
  }
});
