var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var album = new Schema({
  owner: String,
  title: String,
  albumPath: String,
  isonhomepage: String,
  images:  [{ type: Schema.Types.ObjectId ,imagePath: String , ref: 'Image' }],
  created_at: Date,
  updated_at: Date
});
album.pre('save',function(next){
  var currentDate = new Date().toISOString()
  this.updated_at = currentDate;
  if(!this.created_at){
    this.created_at = currentDate;
    next();
  }
})

// the schema is useless so far
// we need to create a model using it
// var User = mongoose.model('User', album);

// // make this available to our users in our Node applications
// module.exports = {
//   User     : User
// }
module.exports = mongoose.model("Album", album);