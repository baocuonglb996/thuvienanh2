var express = require('express');
var router = express.Router();
var Image = require('../model/image');
var User = require('../model/user');
var Album = require('../model/album');
var Comment = require('../model/comment');



router.post('/searchalbum',function(req,res){
  var userid = null;
  if(req.session.user){
  userid = req.session.userid;
  }
  Album.find({isonhomepage:"true"},function(err,albums){
    var albums_result = [];
    var key_search = req.body.search;
    var length_albums = 0;
    albums.forEach(function(album){
        if(album.title.toLowerCase().indexOf(key_search) > -1){
          ++length_albums;
          Image.find({itsalbum: album._id},function(err, img){
           var object_custom_album = {};
           object_custom_album.images = img;
           object_custom_album.album = album;
           albums_result.push(object_custom_album);
           --length_albums;
           if(length_albums === 0){
            console.log(albums_result);
              res.render("searchpage",{userid: userid, albums_result:albums_result,userlogin: req.session.user != null });
           }
         })
        }
    })
  })
})



/* GET home page. */

router.get("/",function(req, res, next){
 var userid = null;
 if(req.session.user){
  userid = req.session.userid;
}
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
     --length_albums;
     if(length_albums === 0){
       res.render("newindex",{userid: userid, album: albums,all_album_onhome:all_album_onhome,userlogin: req.session.user != null});
     }
   })
  })  
})
})
/*Detail album*/
// router.get("/album/:_id",function(req, res){
//    var userid = null;
//   if(req.session.user){
//     userid = req.session.userid;
//   }
//   Image.find({itsalbum:req.params._id},function(err, imgs){
//     if(err) return err;
//     Album.findOne({_id: req.params._id},function(err,album){
//       if(err) return err;
//       res.render("detailalbum",{userid: userid,imgs:imgs,album:album,userlogin: req.session.user != null});
//     })

//   })
// })


router.get("/album/:_id",function(req, res){
 var userid = null;
 if(req.session.user){
  userid = req.session.userid;
    }
    Image.find({itsalbum:req.params._id},function(err, imgs){
      if(err) return err;
      Album.findOne({_id: req.params._id},function(err,album){
        if(err) return err;
        var all_img_ondetail = [];
        var length_imgs = 0;
        imgs.forEach(function(img){
          ++length_imgs;
          Comment.find({comment_in_img: img._id},function(err, cmts){
            if(err) return err;
           var object_custom_cmts = {};
           object_custom_cmts.comments = cmts;
           object_custom_cmts.img = img;
           all_img_ondetail.push(object_custom_cmts);
           console.log(all_img_ondetail);
           --length_imgs;
           if(length_imgs === 0){
             res.render("detailalbum",{userid: userid,imgs:imgs, album: album,all_img_ondetail:all_img_ondetail,userlogin: req.session.user != null});
           }
         }) 
        })
        // res.render("detailalbum",{userid: userid,imgs:imgs,album:album,userlogin: req.session.user != null});
      })
    })
})


/* GET home page. */
router.get('/oldhomepage', function(req, res, next) {

	//tìm hết id của img chứa comment: có 5 id chứa comment;
	// mỗi img chứa comment tìm hết tất cả các id comment để lấy nội dung.
	// object hội tụ kết quả các truy vấn cần đạt được có dạng
	// result = [{id_img_hascmt: ObjectId, comments:[{usercomment:data, content,data},{usercomment:data, content,data},..]}];
 var userid = null;
 if(req.session.user){
   userid = req.session.userid;
 }
 result = [];

  Image.find({}) // all
  .populate('comments')
  .exec(function (err, img) {
    if (err) return handleError(err);
    
    var numberRepeat = img.length;
    for(var i = 0; i < numberRepeat; ++i){
      if(img[i].comments.length > 0){
      	// console.log(img[i]._id);
      	var obj_img = {};//object in result array'
      	var comments = [];// array in obj_img;
      	 obj_img.id_img_hascmt = img[i]._id; // each id of img that has comment will be copyed into this object.	 
        img[i].comments.forEach(function(key){
          var day_date = key.created_at.toISOString().substring(0,10).split("-").reverse().join('-');
          var hour_date = key.created_at.toISOString().substring(11,19);
          var user_content = {};// object in array comments.
          user_content.day_date = day_date;
          user_content.hour_date = hour_date;
          user_content.usercomment = key.user_comment;
          user_content.content = key.content;
          user_content.username = key.username;

            // try to use callback custome;
            comments.push(user_content);
          })
        obj_img.comments = comments;
           // console.log(obj_img);
           result.push(obj_img);
         }  
       }

       Image.count(function(err,numberdocs){
        var page = numberdocs/12;
        if(page != parseInt(page)){
         page = parseInt(page)+1;
       }
       Image.find(function(err, docs){  
        res.render('index', {results:result, images: docs, userlogin: req.session.user != null, userid: userid,
          pagenumber: page,page_focus: req.query.page});
      }).limit( 12 ).skip( (req.query.page-1)*12 );
     })

     });
});
router.get('/upload', function(req, res, next) {
  res.render('upload', { title: 'Express' });
});


router.get('/test/:_id', function(req, res, next) {
 console.log(req.params._id);
 Image.find(function(err, results) {
  console.log(results);
}).limit( 5 ).skip( 1 );
 res.redirect('/');
});


router.get('/multiupload',function(req, res, next){
  res.render('multiple_file_upload');
})
// router.get('/login', function(req, res, next) {
// 	var message = req.flash('error');
// 	console.log(message);
//   res.render('login', {message: message, hasError: message.length > 0});
// });
// router.get('/userprofile',isLoggedIn, function(req, res, next) {
//   res.render('profileUser', { title: 'Express' });
// });


module.exports = router;

// function isLoggedIn(req, res, next){
//   if(req.isAuthenticated()){
//     return next();
//   }
//   res.redirect('/admin/login');
// }