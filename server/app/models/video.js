'use strict'
var mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId
var Mixed = mongoose.Schema.Types.Mixed
var videoSchema = new mongoose.Schema({
  author:{
    type:ObjectId,
    ref:'User'
  },
  qiniu_key: String,
  persistentId:String,
  qiniu_final_key:String,
  qiniu_detail:Mixed,
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
videoSchema.pre('save',function(next){
  if (!this.isNew) {
    this.meta.updateAt = Date.now()
  }else{
    this.meta.createAt=this.meta.updateAt = Date.now()
  }
  next()
})
var uvideoModel = mongoose.model('Video',videoSchema)
