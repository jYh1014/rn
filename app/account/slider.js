
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
import Button from 'react-native-button'
import request from '../common/request'
import config from '../common/config'
import Icon from 'react-native-vector-icons/Ionicons'
import Swiper from 'react-native-swiper'
const width = Dimensions.get('window').width;
export default class Slider extends Component {
  constructor(props){
    super(props);
    this.state = {
     
    }
  }
  _enter(){
     
      this.props.enterSlide()
  }
  
  render() {
    
    return (
        <Swiper 
        style={styles.container} 
        showsButtons={true}
        dot = {<View style={styles.dot}/>}
        activeDot = {<View style={styles.activeDot}/>}
        paginationStyle = {styles.pagination}
        loop = {false}
        >
            <View style={styles.slide}>
                <Image style={styles.image} source={require('../../images/20160325121302_dsm2u.jpeg')}/>
            </View>
            <View style={styles.slide}>
                <Image style={styles.image} source={require('../../images/20120403181210_cuACB.jpeg')}/>
            </View>
            <View style={styles.slide}>
                
                <Image style={styles.image} source={require('../../images/01bd27591e635aa801216a3e0a7819.jpg@2o.jpg')}/>
                <Button style={styles.btn} onPress={this._enter.bind(this)}>马上体验</Button>
            </View>
        </Swiper>
    );
  }
}

const styles = StyleSheet.create({
    container:{
        // flex:1,
        
    },
    slide:{
        flex:1,
        width:width
    },
    image:{
        flex:1,
        width:width
    },
    btn: {
        position:'absolute',
        // padding: 10,
        paddingTop:0,
        marginTop:15,
        borderRadius:2,
        borderColor:'#ee735c',
        borderWidth:1,
        backgroundColor:'#ee735c',
        color:'#222',     
        left:10,
        bottom:60,
        height:50,
        lineHeight:50,
        width:width-20,
        fontSize:18
      },
      dot:{
          backgroundColor:'transparent',
          width:13,
          height:13,
          borderWidth:1,
          borderColor:"#ff6600",
          borderRadius:7,
          marginLeft:12,
          marginRight:12
      },
      activeDot:{
          width:14,
          height:14,
          borderWidth:1,
          borderRadius:7,
          marginLeft:12,
          marginRight:12,
          borderColor:"#ee735c",
          backgroundColor:'#ee735c'
      },
      pagination:{
          bottom:30
      }
});
