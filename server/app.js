'use strict'

var fs = require('fs')
var mongoose = require('mongoose')
var path = require('path')
// var db = 'mongodb://localhost/firstDB'
mongoose.Promise = require('bluebird')
// mongoose.connect(db)
var dbUrl = 'mongodb://first_IOS_runner:18210385076@127.0.0.1:27017/firstDB'
var env = process.env.NODE_ENV || 'development'
if(env === 'development'){
  dbUrl = 'mongodb://localhost/firstDB'
}
mongoose.connect(dbUrl)
mongoose.connection.on('connected',function(){
    console.log('connect success')
})

mongoose.connection.on('disconnected',function(){
    console.log('disconnect')
})

mongoose.connection.on('error',function(){
    console.log('connect fail')
})
var models_path = path.join(__dirname,'/app/models')
var walk = function(modelPath){
  fs.readdirSync(modelPath)
    .forEach(function(file){
      var filePath = path.join(modelPath,'/'+file);
      var stat = fs.statSync(filePath);
      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(filePath)
        }
      }
      else{
        walk(filePath)
      }
    })
}
walk(models_path)
 const koa = require('koa')
 const app = koa()
 const logger = require('koa-logger')
 const session = require('koa-session')
 const bodyParser = require('koa-bodyparser')

 app.keys = ['jyy'];
 app.use(logger());
 app.use(session(app));
 app.use(bodyParser());

const router = require('./config/routes.js')()

app.use(router.routes())
    .use(router.allowedMethods())
 app.use(function *(next){
  //  console.log(this);
   this.body = {
     success: true
   }
    yield next;
 })
 app.listen(3001)
