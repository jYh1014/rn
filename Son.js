
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default class firstIOD extends Component {
  constructor(props){
    super(props);
    // this.state={times:0};
  }
  timeAdd(){
    this.props.timesAdd(this.props.times);
  }
  timeReset(){
    this.props.timesReset();
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome} onPress = {this.timeAdd.bind(this)}>
          女儿说：有本事揍我啊
        </Text>
        <Text style={styles.welcome}>
          居然揍了我{this.props.times} 次
        </Text>
        <Text style={styles.welcome} onPress = {this.timeReset.bind(this)}>
          信不信我亲亲你
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
