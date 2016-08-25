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
    }
};



