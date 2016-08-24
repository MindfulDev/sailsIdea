/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var bcrypt = require('bcryptjs');
var ObjectID = require('mongodb').ObjectID;

module.exports = {

  attributes: {
/*    id: {
      type: 'objectid',
      unique: true,
      primaryKey:true
    },*/
    name: {
      type: 'string'
    },
    username: {
      type: 'string',
      unique: true,
    },
    email: {
      type: 'string',
      unique: true,
      required: true,
      contains: '@'
    },
    password: {
      type: 'string',
   //   minLength: 6,
  //    required: true
    },
    ideas: {
      collection: 'idea',
      via: 'userId'
    },
    
    toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      return obj;
    }
  },
  
  beforeCreate: function(user, cb) {

    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) {
          console.log(err);
          cb(err);
        } else {
          user.password = hash;
          cb();
        }
      });
    });
    
  },

/*  beforeValidate: function(user, cb) {
    if(typeof user.id === 'string') {
      user._id = new ObjectID(user.id);
    }
    console.log(user);
    cb();
  }*/
};

