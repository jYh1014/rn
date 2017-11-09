'use strict'
var qiniu = require('qiniu')
var config = require('../../config/config')
var sha1 = require('sha1')
var uuid = require('uuid')
var Promise = require('bluebird')
qiniu.conf.ACCESS_KEY = 'wiD9TefQEAAcHHLsyBsqjKFMCTDQZyl0TnFxtTzV';
qiniu.conf.SECRET_KEY = 'w75AV3t7LAuDBJX-IsDhwFrLZ5hfuLDZsblsFZ9V';
var bucket = 'haoxiong';
var cloudinary = require('cloudinary')
cloudinary.config(config.cloudinary)

exports.getQiniuToken = function(body){
  var type=body.type;
  var key = uuid.v4();
  var putPolicy;
  var options = {
    persistentNotifyUrl:config.notify
  }
  if (type === 'avatar') {
    key += '.jpeg';
    putPolicy = new qiniu.rs.PutPolicy(bucket + ':' + key);
  }else if (type === 'video') {

    key += '.mp4';
    options.scope='haoxiong:'+key;
    options.persistentOps = 'avthumb/mp4/an/1';

    putPolicy = new qiniu.rs.PutPolicy2(options);
  }else if (type === 'audio') {

  }
  var token = putPolicy.token();
  return {
    key:key,
    token:token
  }
}
exports.getCloudinaryToken = function(body){
  var type = body.type;
  var timestamp = body.timestamp;
  var folder ;
  var tags ;
  if (type === 'avatar') {
    folder = 'avatar';
    tags = 'app,avatar';
  }else if (type === 'video') {
    folder = 'video';
    tags = 'app,video';
  }else if (type==='audio') {
    folder = 'audio';
    tags = 'app,audio';
  }
  var signature = 'folder=' + folder + '&tags=' + tags + '&timestamp=' + timestamp + config.cloudinary.api_secret;
  var key = uuid.v4();
  signature = sha1(signature);
  return {
    token:signature,
    key:key
  }
}
exports.uploadToCloudinary = function(url){
  return new Promise(function(resolve, reject){
    cloudinary.uploader.upload(url,function(result){
      if (result && result.public_id) {
        resolve(result)
      }
      else{
        reject(result)
      }
    },{
      resource_type:'video',
      folder:'video'
    })
  })
}
exports.saveToQiniu = function(url,key){
  var client = new qiniu.rs.Client();
  return new Promise(function(resolve,reject){
    client.fetch(url,'haoxiong',key,function(err,ret){
      if (err) {
        reject(err)
      }else{
        resolve(ret)
      }
    })
  })
}
