'use strict'

const Router = require('koa-router')
const User = require('../app/controllers/user')
const App = require('../app/controllers/app')
const Creation = require('../app/controllers/creation')
const Comment = require('../app/controllers/comment')

module.exports = function (){
  let router = new Router({
    prefix: '/api'
  })
  router.post('/u/signup',App.hasBody,User.signup)
  router.post('/u/verify',App.hasBody,User.verify)
  router.post('/u/update',App.hasBody,App.hasToken,User.update)
  router.post('/signature',App.hasBody,App.hasToken,App.signature)
  router.post('/creations/video',App.hasBody,App.hasToken,Creation.video)
  router.post('/creations/audio',App.hasBody,App.hasToken,Creation.audio)
  router.post('/creations',App.hasBody,App.hasToken,Creation.save)
  router.get('/creations', App.hasToken, Creation.find)
   // votes
   router.post('/up', App.hasBody, App.hasToken, Creation.up)
     // comments
  router.get('/comments', App.hasToken, Comment.find)
  router.post('/comments', App.hasBody, App.hasToken, Comment.save)

  router.get('/',App.homePage)
  return router
}
