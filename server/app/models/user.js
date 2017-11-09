'use strict'
var mongoose = require('mongoose')
var userSchema = new mongoose.Schema({
  phoneNumber: {
    unique:true,
    type:String
  },
  verified:{
    type:Boolean,
    default:false
  },
  areaCode: String,
  verifyCode: String,
  accessToken: String,
  nickName: String,
  gender: String,
  breed: String,
  age: String,
  avatar: String,
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
})
userSchema.pre('save',function(next){
  if (!this.isNew) {
    this.meta.updateAt = Date.now()
  }else{
    this.meta.createAt=this.meta.updateAt = Date.now()
  }
  next()
})
var userModel = mongoose.model('User',userSchema)
