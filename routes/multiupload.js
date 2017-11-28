var express = require('express');
var router = express.Router();
const testFolder = './public/user_album/';
const fs = require('fs');


var multer= require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/multiupload')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  })
var upload = multer({ storage: storage })
router.post('/',upload.array("file"),function(req,res){
  console.log(req.files);
  res.redirect('/multiupload');
})
/* this code below takes all the names of folder in a defined directory*/
router.get('/testhaha',function(req, res){
  fs.readdir(testFolder, function(err, files){
  files.forEach(function(file){
    console.log(file);
  });
  res.redirect('/multiupload');
})
})
/* try  to create a new folder in a particular directory*/
router.get('/makedir',function(req, res){
  var dir = './public/user_album/huhu';

  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }
})
module.exports = router;