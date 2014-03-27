var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  defaults: {

  },
  links: function() {
    return this.hasMany(Link);
  },
  initialize: function(){

  },
  changePassword : function(newPassword){
    this.set('password', newPassword);
  },

});

module.exports = User;
