/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var passport = require('passport');
var bcrypt = require('bcryptjs');
//var ObjectID = require('mongodb').ObjectID;

module.exports = {

    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },

    login: function(req, res) {

        passport.authenticate('local', function(err, user, info) {
            if ((err) || (!user)) {

                return res.notFound(new Error('Unknown user'), 'login');
            }
            req.logIn(user, function(err) {
                if (err) res.send(err);                
                return res.redirect('/ideas');
            });

        })(req, res);
    },

    logout: function(req, res) {
        req.logout();
        res.redirect('/');
    },

    signup: function(req, res) {
        console.log(req.body);
        User.create(req.body).exec(function(err, user) {
           if(err) { return res.serverError(err);}
            res.redirect('/');
        });

    },

 
/*    test: function(req, res) {
        User.findOne({ id: "57b6fefb7c1af13f114448d5" }).exec(function (err, user) {
           res.json(user);
            console.log(user);
            user.save(function(err){
                if (err) { return res.serverError(err); }
                return res.ok();
            });

        });


    }*/
};
