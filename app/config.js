var Bookshelf = require('bookshelf');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var crypto = require('crypto');



var mongoose = require('mongoose');
mongoose.connect('mongodb://DBLab:tCvk0hqVfe12_bj9megq8UUtvvm9y1YxlIIgYc0bJe8-@ds042888.mongolab.com:42888/DBLab', function(err){
  if (err) {
    console.log('error in connect in config.js', err);
    throw err;
  } else {
    console.log('connected to the database correctly');
  }
});

var Schema = mongoose.Schema;

var urlSchema = new Schema({
  url: String,
  base_url: String,
  code: String,
  title: String,
  visits: Number
});

urlSchema.pre('save', function(next){
    var shasum = crypto.createHash('sha1');
    shasum.update(this.url);
    this.code = shasum.digest('hex').slice(0, 5);
  next();
});

var userSchema = new Schema({
  username: String,
  password: String
});

userSchema.pre('save', function(next){
  this.hashPassword();

  next();
});

userSchema.methods.hashPassword = function(){
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
    });
};

module.exports.Url = urlSchema;
module.exports.User = userSchema;
