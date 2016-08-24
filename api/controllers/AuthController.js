/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var passport = require('passport');
var bcrypt = require('bcryptjs');
var ObjectID = require('mongodb').ObjectID;

module.exports = {

    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },

    login: function(req, res) {

        passport.authenticate('local', function(err, user, info) {
            if ((err) || (!user)) {
                return res.send({
                    message: info.message,
                    user: user
                });
            }
            req.logIn(user, function(err) {
                if (err) res.send(err);                
                return res.send({
                    message: info.message,
                    user: user
                });
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
    test: function(req, res) {
        User.findOne({ id: "57b6fefb7c1af13f114448d5" }).populate('ideas').exec(function (err, user) {
            Idea.findOne( {id: "57bb358f3d49414612ddc268"}).exec( function (err, idea) {
                console.log(user);
                console.log(user.ideas);
                user.ideas.add( idea.id );
                user.save(function(err){
                    if (err) { return res.serverError(err); }
                    return res.ok();
                });
            });
            res.json(user);
        });


    },
    addIdea: function (req, res) {  /* POSTed data */
        var title  = req.body ? req.body.title : undefined,
            detail = req.body ? req.body.detail : undefined;
        //technically - once policies in place, this action not available unless logged in.
        if ( ! req.user ) {
            return res.badRequest("Cannot add idea without a logged in user");
        } else if ( ! title && ! detail) {
            return res.badRequest("Need a title or detail to create idea");
        } else {

                User.findOne( { id : req.user.id })
                    .then( (user) => {
                        if (! user) { return res.notFound( "User Not Found"); }
                        Idea.create({ title: title || '', detail: detail || ''})
                            .then( (idea) => {
                                user.ideas.add(idea);
                                user.save()
                                    .then ( () => res.json(user) )
                                    .catch( (err) => { res.serverError(err) });
                            })
                            .catch( (err) => res.serverError(err));
                      })
                    .catch((err) => { res.serverError(err) });
            }
        },
    getIdea: function(req, res) {
        var ideaId = req.body ? req.body.ideaId : undefined;
        if (! ideaId) {
            return res.badRequest("Need id of idea");
        } else {
            Idea.findOne( { id : ideaId }).populate('userId')
                .then( (idea) => {
                    if(! idea) { 
                        return res.notFound( "Idea not found");
                    } else {
                        res.locals.idea = idea;
                        return res.json(idea);
                    }
                })
                .catch((err)=> res.serverError(err));
        }

        
    },
    getIdeas: function(req, res) {
        res.locals.paged = req.query.paged || 1;
        res.locals.posts_per_page = req.query.posts_per_page || 20;
        Idea.find()
            .paginate({page:res.locals.paged, limit: res.locals.posts_per_page})
            .populate('userId')
            .then( function(ideas) {
                if (! ideas) {
                    return res.notFound("Ideas not found");
                } else {
                    return res.json(ideas);
                }
            })
            .catch((err)=> res.serverError(err));
        
    }, 

    removeIdea: function(req, res){
        //TODO check to see that logged in user matches userId on idea or admin user (<-policy?)
        var ideaId = req.body ? req.body.ideaId : undefined;
        if (! ideaId) {
            return res.badRequest("Need id of idea");
        } else {
            Idea.destroy( { id : ideaId })
                .then( (idea) => {
                    if(idea.length === 0) {
                        return res.notFound("Idea not found");
                    }
                    return res.json(idea);
                })
                .catch((err)=> res.serverError(err));
        }
    },
    updateIdea: function(req, res){
        //TODO check to see that logged in user matches userId on idea or admin user (<-policy?)
        var ideaId = req.body ? req.body.ideaId : undefined,
            title  = req.body ? req.body.title : undefined,
            detail = req.body ? req.body.detail : undefined;
        if ( ! ideaId ) {
            return res.badRequest("Need id of idea to update");
        } else if ( ! title && ! detail) {
            return res.badRequest("Need a title or detail to update idea");
        } else {
            Idea.findOne( { id : ideaId })
                .then( (idea) => {
                    if( ! idea ) {
                        return res.badRequest("idea not found");
                    } else {
                        if (idea.userId != req.user.id ) {   //TODO OR logged in user not admin role
                            return res.forbidden("Idea not yours to update");
                        }
                        idea.title = title?title:idea.title;
                        idea.detail = detail?detail:idea.detail;
                        idea.save()
                            .then ( () => res.json(idea) )
                            .catch((err)=>res.serverError(err));
                    }
                })
                .catch((err)=>res.serverError(err));
        }
    }
    
//TODO get count info from queries
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
