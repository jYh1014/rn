
const option = {
  header: {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    }
  },
  qiniu:{
    base:'owthc2jo8.bkt.clouddn.com/',
    upload:'http://upload.qiniu.com/'
  },
  cloudinary:{
  cloud_name: 'babeying',
  api_key: '116484876416239',
  api_secret: 'L1mV7t9ImMqzTA6Csp0XubewHd4',
  base: 'http://res.cloudinary.com/babeying',
  image: 'https://api.cloudinary.com/v1_1/babeying/image/upload',
  video: 'https://api.cloudinary.com/v1_1/babeying/video/upload',
  audio: 'https://api.cloudinary.com/v1_1/babeying/raw/upload',
},
  api: {
    base:"http://localhost:8080/",
    // base: "http://rapapi.org/mockjs/25467/",
    creations: "api/creations",
    up: "api/up",
    comment: "api/comments",
    signup: "api/u/signup",
    verify: "api/u/verify",
    signature: "api/signature",
    update: "api/u/update",
    video:"api/creations/video",
    audio:"api/creations/audio"
  }
}
export default option
