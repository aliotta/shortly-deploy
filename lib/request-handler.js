var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({},function(err, links){
    console.log(links);
    res.send(200, links);
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;
  console.log("Trying to save link")

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.findOne({ url: uri }, function(err, url) {
    if (err) {
      console.error(err);
      throw err;
    }
    if (url) {
      console.log("url exists:", url)
      res.send(200, url);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        var newLink = Link({
          url: uri,
          title: title,
          base_url: req.headers.origin,
          visits: 0
        });
        console.log("before save link", newLink)
        newLink.save().then(function(newLink) {
          console.log("newLink: " , newLink)
          res.send(200, newLink);
        });
      });
    }
  })
}



var comparePassword = function(attemptedPassword, dbPassword, callback) {
    bcrypt.compare(attemptedPassword, dbPassword, function(err, isMatch) {
      callback(isMatch);
    });
}

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username}, function(err, user){
    if(err){
      console.error(err)
      throw err
    }
    if(!user){
      res.redirect('/login');
    } else {
      comparePassword(password, user.password, function(match) {
        if (match) {
          util.createSession(req, res, user);
        } else {

          res.redirect('/login');
        }
      })
    }
  })

 };


exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username },function(err, user){
    if (!user) {
      var newUser = new User({
        username: username,
        password: password
      });
      newUser.save()
        .then(function(newUser) {
          util.createSession(req, res, newUser);
          res.redirect('/');
        });
    } else {
      res.redirect('/signup');
    }
  })
};


exports.navToLink = function(req, res) {
  Link.findOne({ code: req.params[0] }, function(err, link) {
    console.log("navToLink: ", link);
    if (!link) {
      res.redirect('/');
    } else {
      link.visits =  link.visits + 1
      link.save();
      res.redirect(link.get('url'));
    }
  });
};
