var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
var fs = require('fs');

var bcrypt = require('bcrypt');

var app = express();

var isLoggedIn = function(req){
  if(req.session.user){
    return true;
  }else{
    return false;
  }
};

var isPublic = function(req){
  //if request the create user page || login page
  if(req.url === '/links' ||
    req.url === '/create'){
    return false;
  }else{
    return true;
  }
};

var renderHome = function(res){
  res.render('index.html');
};

var authenticate = function(req, res, next){
  if (req.url === '/isLoggedIn') {
    console.log('logged in probe', isLoggedIn(req));
    return res.send(isLoggedIn(req) ? 201 : 400);
  } else if(isLoggedIn(req) || isPublic(req)){
    console.log('logged in or public', req.url, isLoggedIn(req), isPublic(req));
    return next();
  }else{
    //res.send(400);
    renderHome(res);
  }
};

app.configure(function() {
  app.engine('html', require('ejs').renderFile);
  app.set('views', __dirname + '/public/client');
  app.set('view engine', 'ejs');
  app.use(partials());
  app.use(express.bodyParser());
  app.use(express.cookieParser('randomtyping'));
  app.use(express.session());
  app.use(authenticate);
  app.use(express.static(__dirname + '/public'));
});

// var sendIndex = function(res){
//   fs.readFile('/client/index.html', function(){

//   });
// };


app.get('/', function(req, res) {
  renderHome(res);
});

app.get('/create', function(req, res) {
  renderHome(res);
});

app.get('/login', function(req, res) {
  renderHome(res);
});

app.get('/signup', function(req, res) {
  renderHome(res);
});
//user login/signup =======================================

var passwordHash = function(string){
  //
};

app.post('/signup', function(req, res){
  console.log('signup');
  bcrypt.genSalt(12, function(err, salt){
    console.log('salt', salt);
    bcrypt.hash(req.body.password, salt, function(err, hash){
      console.log('req.password', req.body.password);
      req.body.password = hash;
      User.forge({
        username: req.body.username,
        password: req.body.password,
      }).save().then(function(){
        Users.query({}).fetch().then(function(users){
          console.log(JSON.stringify(users, null, 2));
        });
        console.log('saved', req.body.username, req.body.password);
        req.session.regenerate(function(){
          req.session.user = req.body.username;
          res.redirect(301, '/');
        });
      });
    });
  });
});

app.post('/login', function(req, res){
  //fetch username and password
  //compare req.body.username nad req.body.password
  //if matching, redirect to home page
  //else send error message
  //Users.query({}).fetch()//.then(function(users){
  //   console.log(JSON.stringify(users, null, 2));
  // });
  //console.log(Users._knex);
  //Users._knex = null;
  //console.log(Users.sync());
  //console.log(Users.sync);
  Users.resetQuery();
  Users.query({where: {
    username: req.body.username
  }}).fetchOne().then(function(user){
    // console.log('\n users============\n', Users._knex.bindings, Users._knex.wheres, '\n users============\n');
    // console.log('\n model============\n', model._knex.bindings, model._knex.wheres, '\n model============\n');
    if (!user){
      console.log('not found', req.body);
      return res.redirect(301, '/');
    }
    console.log(user);
    bcrypt.compare(req.body.password, user.attributes.password, function(err, match){
      console.log(user.attributes.password, match);
      if (match){
        req.session.regenerate(function(){
          req.session.user = req.body.username;
          res.redirect(301, '/');
        });
      } else {
        res.send(400);
      }
    });
  });
});

app.post('/logout', function(req, res){
  req.session.destroy(function(){
    console.log(arguments);
    console.log("req.session", req.session, "req.body ", req.body)
    res.redirect(301, '/login');
  });
});

//links ===================================================
app.get('/links', function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links', function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect(301, '/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(301, link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
