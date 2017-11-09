'use strict'
var mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId
var Mixed = mongoose.Schema.Types.Mixed
var audioSchema = new mongoose.Schema({
  author:{
    type:ObjectId,
    ref:'User'
  },
  video:{
    type:ObjectId,
    ref:'Video'
  },
  qiniu_video:String,
  qiniu_thumb:String,
  public_id:String,
  detail:Mixed,
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
audioSchema.pre('save',function(next){
  if (!this.isNew) {
    this.meta.updateAt = Date.now()
  }else{
    this.meta.createAt=this.meta.updateAt = Date.now()
  }
  next()
})
var uvideoModel = mongoose.model('Audio',audioSchema)
