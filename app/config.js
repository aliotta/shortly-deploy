var Bookshelf = require('bookshelf');
var path = require('path');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');

// var db = Bookshelf.initialize({
//   client: 'sqlite3',
//   connection: {
//     host: '127.0.0.1',
//     user: 'your_database_user',
//     password: 'password',
//     database: 'shortlydb',
//     charset: 'utf8',
//     filename: path.join(__dirname, '../db/shortly.sqlite')
//   }
// });

// db.knex.schema.hasTable('urls').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('urls', function (link) {
//       link.increments('id').primary();
//       link.string('url', 255);
//       link.string('base_url', 255);
//       link.string('code', 100);
//       link.string('title', 255);
//       link.integer('visits');
//       link.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });

// db.knex.schema.hasTable('users').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('users', function (user) {
//       user.increments('id').primary();
//       user.string('username', 100).unique();
//       user.string('password', 100);
//       user.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });

// module.exports = db;

// grab the things we need
// var mongoose = require('mongoose');
// var Schema = mongoose.Schema;

// // create a schema
// var userSchema = new Schema({
//   name: String,
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   admin: Boolean,
//   location: String,
//   meta: {
//     age: Number,
//     website: String
//   },
//   created_at: Date,
//   updated_at: Date
// });

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var Schema = mongoose.Schema;

var urlSchema = new Schema({
  url: String,
  base_url: String,
  code: String,
  title: String,
  visits: Number
});

urlSchema.pre('save', function(next){
  var initialize = function(){
      var shasum = crypto.createHash('sha1');
      shasum.update(this.url);
      this.code = shasum.digest('hex').slice(0, 5);
    };
  }
  initialize();

});
// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
//   initialize: function(){
//     this.on('creating', function(model, attrs, options){
//       var shasum = crypto.createHash('sha1');
//       shasum.update(model.get('url'));
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }
// });

var userSchema = new Schema({
  username: String,
  password: String
});

userSchema.pre('save', function(next){
  var hashPassword = function(){
    var cipher = Promise.promisify(bcrypt.hash);
    return cipher(this.password, null, null).bind(this)
      .then(function(hash) {
        this.password = hash;
      });
  };
  hashPassword();

  next();
});

// hashPassword: function(){
//     var cipher = Promise.promisify(bcrypt.hash);
//     return cipher(this.get('password'), null, null).bind(this)
//       .then(function(hash) {
//         this.set('password', hash);
//       });
//   }

// userSchema.pre('save', function(next) {
//   // get the current date
//   var currentDate = new Date();
  
//   // change the updated_at field to current date
//   this.updated_at = currentDate;

//   // if created_at doesn't exist, add to that field
//   if (!this.created_at)
//     this.created_at = currentDate;

//   next();
// });

// var Url = mongoose.model('Url', urlSchema);
// var User = mongoose.model('User', userSchema);

module.exports.Url = urlSchema;
module.exports.User = userSchema;
