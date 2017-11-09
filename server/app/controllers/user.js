'use strict'
var mongoose = require('mongoose')
var User = mongoose.model('User')
var xss = require('xss')
var uuid = require('uuid')
var sms = require('../service/sms')
exports.signup = function *(next) {

  var phoneNumber = this.request.body.phoneNumber;
  var user = yield User.findOne({
    phoneNumber: phoneNumber
  }).exec();
  var verifyCode = sms.getCode();
  if (!user) {
    var accessToken = uuid.v4()
    user = new User({
      phoneNumber: xss(phoneNumber),
      verifyCode: verifyCode,
      accessToken: accessToken,
      nickName: '好好熊',
      avatar: '../images/jy.jpg'
    })
  } else {
    user.verifyCode = verifyCode
  }

  try {
    user = yield user.save()
  } catch (e) {
    this.body = {
      success: false
    }
    return next
  }
  var msg = '您的注册验证码是：' + user.verifyCode;

  try {
    sms.send(user.phoneNumber, msg)
  } catch (e) {
    this.body = {
      success: false,
      err: '短信服务异常'
    }
    return next
  }
  this.body = {
    success: true
  }
}
exports.verify = function *(next) {
  var verifyCode = this.request.body.verifyCode;
  var phoneNumber = this.request.body.phoneNumber;
  if (!verifyCode || !phoneNumber) {
    this.body = {
      success: false,
      err: '验证没通过'
    }
    return next
  }
  var user = yield User.findOne({
    phoneNumber: phoneNumber,
    verifyCode: verifyCode
  }).exec()
  if (user) {
    user.verified = true;
    user = yield user.save();
    this.body = {
      success: true,
      data: {
        nickName: user.nickName,
        avatar: user.avatar,
        accessToken: user.accessToken,
        _id: user._id
      }
    }
  } else {
    this.body = {
      success: false,
      err: '验证没通过'
    }
  }
}
exports.update = function *(next) {
  var body = this.request.body;
  var user = this.session.user;
  var fields = 'avatar,gender,age,breed,nickName'.split(',');
  fields.forEach(function(field) {
    if (body[field]) {
      user[field] = body[field]
    }
  })
  user = yield user.save()
  this.body = {
    success: true,
    data: {
      nickName: user.nickName,
      avatar: user.avatar,
      accessToken: user.accessToken,
      age: user.age,
      gender: user.gender,
      breed: user.breed,
      _id: user._id
    }
  }
}
// export {signup,verify,update}
