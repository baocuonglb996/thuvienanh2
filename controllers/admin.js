var express = require('express');
var router = express.Router();
var Image = require('../model/image');
var Admin = require('../model/admin');
var User = require('../model/user');
var Album = require('../model/album');
var Imagecensor =  require('../model/imagecensor');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var mv = require('mv');
var Schema = mongoose.Schema;
const fs = require('fs');


passport.use(new LocalStrategy({passReqToCallback: true},
  function(req,username, password, done) {
    Admin.findOne({ admin: username }, function (err, admin) {
      if (err) { return done(err); }
      if (!admin) {
        return done(null, false,{message:'Incorrect name or password!'});
      }
      if (!admin.validPassword(password)) {
        console.log("asjdaskdjsaldjlasjkdlasjdlsadas");
        return done(null, false, {message:'Incorrect name or password!'});   
      }
      if(!req.session.admin){
        req.session.admin = true;
      }
      return done(null, admin);
    });
  }
  ));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Admin.findById(id, function(err, user) {
    done(err, user);
  });
});


router.post("/",passport.authenticate('local', { successRedirect: '/admin/management',
 failureRedirect: '/admin/login',
 failureFlash: true }))

router.get('/login', function(req, res, next) {
  var message = req.flash('error');
  res.render('admin/login', {message: message, hasError: message.length > 0});
});

router.get('/management',isLoggedIn, function(req, res, next) {
  Image.find(function(err, docs){
   res.render('admin/management', { title: 'Admin management', images: docs });
 });
});

router.get('/logout', function(req, res, next) {
  if(req.session.admin){
    req.session.admin = null;
  }
  res.redirect("/admin/login");
});

router.post('/uploadable/:_id',isLoggedIn,function(req, res){
  console.log(req.body.state_before_change);
  if(req.body.state_before_change === "No"){
   User.findOneAndUpdate({_id:req.params._id},
    {"$set": {"uploadable": "true"}}, 
    function (err) {
      if (err) res.send(err);
      res.json({message: "changed successfully"});       
    })
 }else{
  User.findOneAndUpdate({_id:req.params._id},
    {"$set": {"uploadable": "false"}}, 
    function (err) {
      if (err) res.send(err);
      res.json({message: "changed successfully"});       
    })

}

})
// delete this router after finishing test;
router.get("/testuser",function(req, res){
  User.find({},function(err, users){
    res.render("test",{users: users});
  })
})


router.get('/censor',isLoggedIn, function(req, res, next) {
  Imagecensor.find(function(err, docs){
   res.render('admin/censor', { imagecensors: docs });
 });
});

router.get('/user',isLoggedIn, function(req, res, next) {
  User.find(function(err, users){
   res.render('admin/usermanagement', { users: users });
 });
});

router.route('/deleteuser/:_id')
.delete(isLoggedIn,function(req, res){
  if(req.params._id){
      //console.log("ket qua " + req.body.result_product)
      User.remove({'_id': req.params._id}, function(err, user){
        if(err) 
          return res.send(err);
        else
          res.send({message: "deleted  successfully user " + req.params._id });
        
      });
    }

  })


router.route('/updateimg').get(function(req, res){
  Image.findOne({_id: req.query.id}, function(err,result){
    var idtoupdate = req.query.id;
    if(err) throw err;
    else{
      res.render('admin/updateimg', {id_update:idtoupdate,update_image:result});
    }
  });
});

router.route('/delimage')
.delete(function(req, res){
	if(req.body.imagetodelete){
		  //console.log("ket qua " + req.body.result_product)
		  Image.remove({'_id': req.body.imagetodelete}, function(err, product){
        if(err) 
         return res.send(err);
       else
        res.send({notify: "deleted successfully " + req.body.imagetodelete });
      
    });
   }

 })
router.route('/updateimg/:_id')
.put(function(req, res){
	Image.findOneAndUpdate({_id:req.params._id},
		{"$set": {"title": req.body.title, "describe": req.body.description}}, 
		function (err) {
      if (err) res.send(err);
      res.json({notify: "updated successfully "});       
      console.log('Record updated');
    })
})

router.get('/login', function(req, res, next) {
  var message = req.flash('error');
  res.render('admin/login', {message: message, hasError: message.length > 0});
});

router.route('/censordetail').get(function(req, res){
  Imagecensor.findOne({_id: req.query.id}, function(err,result){
    var idtocensor = req.query.id;
    if(err) throw err;
    else{
      res.render('admin/censordetail', {id_censor:idtocensor,censor_image:result});
    }
  });
});

router.post('/censored',isLoggedIn, function(req, res, next){



  Imagecensor.findOne({_id: req.body.imagetocensor}, function(err, censorimg){

    Imagecensor.remove({'_id': censorimg._id}, function(err, img){
      if(err)  return err;
    });

    var array =  censorimg.imagecensorPath.split('r/');
    mv('./public/'+censorimg.imagecensorPath, './public/images/'+array[1], function(err) {
      if(err){ return err; }   
    });

    var image = new Image({
      imagePath: "/images/"+array[1],
      title: censorimg.title,
      describe: censorimg.describe,
    });
    image.save(function(error){
      if(error) return error;
      console.log("save successfully");
    })

    res.json({message: "censored successfully "});   
  })
})


router.delete('/delsensorimage',isLoggedIn,function(req, res){
  if(req.body.imagetodelete){
      // var pathunlink = './public/imagecensor/'+
      //   fs.unlink('/12.jpg', (err) => {
      //   if (err) throw err;
      //     console.log('successfully deleted');
      //   });
      Imagecensor.remove({'_id': req.body.imagetodelete}, function(err, product){
        if(err) 
          return res.send(err);
        else
          res.send({message: "deleted successfully " + req.body.imagetodelete });
      });
    }
  })

router.get("/albummanagement", isLoggedIn, function(req, res, next){

  Album.find({isonhomepage:"true"},function(err, albums){
    if(err) return err;
    var all_album_onhome = [];
    var length_albums = 0;
    albums.forEach(function(album){
      ++length_albums;
      Image.find({itsalbum: album._id},function(err, img){
       var object_custom_img = {};
       object_custom_img.images = img;
       object_custom_img.album = album;
       all_album_onhome.push(object_custom_img);
       console.log(all_album_onhome);
       --length_albums;
       if(length_albums === 0){
         res.render("admin/albummanagement",{ album: albums,all_album_onhome:all_album_onhome});
       }
     })
    })  
  })
})


router.get("/album/:_id",isLoggedIn,function(req, res){

  Image.find({itsalbum:req.params._id},function(err, imgs){
    if(err) return err;
    Album.findOne({_id: req.params._id},function(err,album){
      if(err) return err;
      res.render("admin/detailalbum",{imgs:imgs,album:album});
    })
  })
})

router.get("/newalbum",isLoggedIn,function(req, res){
  res.render("admin/newalbum");
})

module.exports = router;

function isLoggedIn(req, res, next){
  if (!req.session.admin) {
    res.redirect('/admin/login');
  } else {
    next();
  }
}

// router.post("/login",passport.authenticate('local', { successRedirect: '/admin/management',
//                                    failureRedirect: '/admin/login',
//                                    failureFlash: true }))



// router.get('/management', isLoggedIn , function(req, res, next) {
//   Image.find(function(err, docs){
//      res.render('admin/management', { title: 'Shopping Cart', images: docs });
//   });
// });


// router.get('/' , function(req, res, next) {
//   if(req.user){
//     Image.find(function(err, docs){
//      res.render('admin/management', { title: 'Shopping Cart', images: docs });
//   });
//   }else{
//     console.log("something run here!");
//      res.redirect('/admin/login');
//   }

// });

// module.exports = router;

// function isLoggedIn(req, res, next){
//   if(req.isAuthenticated()){
//     console.log("fuck this shit");
//     return next();
//   }
//   console.log("fucking this shit2");
//   res.redirect('/admin/login');
// }