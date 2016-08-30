/**
 * IdeasController
 *
 * @description :: Server-side logic for managing ideas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    root : function (req, res) {
        Idea.find().populate('userId').exec( function(err,posts) {
            res.locals.posts = posts;
            res.locals.opt = {};
            if (req.user) {
                res.locals.opt.user = req.user;
            }
            res.locals.opt.fields = ['title', 'detail', 'userId.email'];
            res.view('idea/list.pug');
        })
    },

    edit : function (req, res) {
        if (req.method === 'GET') {  // Print out form with idea data
            var id = req.param('id');
            if (!id) {
                return res.badRequest("Need id of idea");
            } else {
                Idea.findOne({id: id}).populate('userId')
                    .then((idea) => {
                        if (!idea) {
                            return res.notFound("Idea not found");
                        } else {
                            res.locals.post = idea;
                            res.locals.opt.fields = ['id', 'title', 'detail'];
                            return res.view('idea/edit.pug');
                        }
                    })
                    .catch((err)=> res.serverError(err));
            }
        } else if (req.method === 'POST') {
            var ideaId = req.body ? req.body.id : undefined,
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
                            if ( !req.user || idea.userId != req.user.id ) {   //TODO OR logged in user not admin role
                                return res.forbidden("Idea not yours to update");
                            }
                            idea.title = title?title:idea.title;
                            idea.detail = detail?detail:idea.detail;
                            idea.save()
                                .then ( () => res.redirect('/ideas'))
                                .catch((err)=>res.serverError(err));
                        }
                    })
                    .catch((err)=>res.serverError(err));
            }
        } else { return res.badRequest('method not implemented')}
    },
    
    add: function (req, res) {
        //TODO need to add authentication policies so only logged in users get here
        if (req.method === 'GET') {  
            res.locals.opt.fields = ['title','detail'];
            return res.view('idea/add.pug');

        } else if (req.method === 'POST') {
            var title = req.body ? req.body.title : undefined,
                detail = req.body ? req.body.detail : undefined;
            if (!title && !detail) {
                return res.badRequest("Need a title or detail to create idea");
            } else {
                Idea.create({ title: title || '', detail: detail || ''})
                    .then( (idea) => {
                        req.user.ideas.add(idea);
                        req.user.save()
                            .then ( () => res.redirect('/ideas') )
                            .catch( (err) => { res.serverError(err) });
                    })
                    .catch( (err) => res.serverError(err));
            }
            
        } else {
            return res.badRequest('method not implemented')
        }

    },

    delete: function (req, res) {
        if (req.method === 'GET') {  
            var ideaId = req.param('id');
            console.log(ideaId);
            if (!ideaId) {
                return res.badRequest("Need id of idea");
            } else {
                Idea.findOne({id: ideaId})
                    .then((idea) => {
                        if (!idea) {
                            return res.notFound("Idea not found");
                        } else if (!req.user && idea.userId != req.user.id) {   //TODO OR logged in user not admin role
                            return res.forbidden("Idea not yours to remove");
                        } else {
                            Idea.destroy({id: ideaId})
                                .then((idea) => {
                                    if (idea.length === 0) {
                                        return res.notFound("Idea not deleted");
                                    }
                                    return res.redirect('/ideas');
                                })
                                .catch((err)=> res.serverError(err));
                        }
                    })
                    .catch((err)=> res.serverError(err));
            }

        } else { return res.badRequest('method not implemented')}

    }

};



