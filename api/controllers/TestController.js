/**
 * TestController
 *
 * @description :: Server-side logic for managing tests
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    addIdea: function (req, res) {  /* POSTed data */
        var title  = req.body ? req.body.title : undefined,
            detail = req.body ? req.body.detail : undefined;
        //technically - once policies in place, this action not available unless logged in.
        if ( ! req.user ) {
            return res.badRequest("Cannot add idea without a logged in user");
        } else if ( ! title && ! detail) {
            return res.badRequest("Need a title or detail to create idea");
        } else {
            Idea.create({ title: title || '', detail: detail || ''})
                .then( (idea) => {
                    req.user.ideas.add(idea);
                    req.user.save()
                        .then ( () => res.json(idea) )
                        .catch( (err) => { res.serverError(err) });
                })
                .catch( (err) => res.serverError(err));
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
            Idea.findOne( { id : ideaId } )
                .then( (idea) => {
                    if (!idea) {
                        return res.notFound("Idea not found");
                    } else if (idea.userId != req.user.id ) {   //TODO OR logged in user not admin role
                        return res.forbidden("Idea not yours to remove");
                    } else {
                        Idea.destroy( { id : ideaId })
                            .then( (idea) => {
                                if(idea.length === 0) {
                                    return res.notFound("Idea not deleted");
                                }
                                return res.json(idea);
                            })
                            .catch((err)=> res.serverError(err));
                    }
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
};

