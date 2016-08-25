# Notes #

## Authentication Notes ##
  * Using [this page](http://iliketomatoes.com/implement-passport-js-authentication-with-sails-js-0-10-2/) to config
  * bcrypt not loading...changed to bcryptjs - no changes bcrypt section for storing password required. tested success
  * After logging in, getting error error: Unable to parse HTTP body- error occurred :: 'Error: Failed to deserialize user out of session\n    at pass (/home/jer0dh/PhpstormProjects/sailsIdea/node_modules/passport/lib/authenticator.js:334:19)\n    at deserialized (/home/jer0dh/PhpstormProjects/sailsIdea/node_modules/passport/lib/authenticator.js:339:7)\n    at /home/jer0dh/PhpstormProjects/sailsIdea/config/passport.js:16:9\n  

  * Narrowed it down to the passport deserializer.  Created a test action where finding user using same query of User.findOne({ id: id },.... 
   Found that it didn't work due to MongoDb ObjectId.  Everything I read seemed to say that Waterline ORM took care of that in the backend. It worked after I 
switched the query to User.findOne({ id: ObjectID(id) }  (after var ObjectID = require('mongodb').ObjectID; where mongodb is loaded as a dependency for sails-mongodb)
   
```
    Tried creating a autoIncrement key for model
    userId: {
      type: 'integer',
      unique: true,
      primaryKey: true,
      autoIncrement: true
    },

    But autoIncrement does not work with mongodb! Crazy there is not a better solution for this.
```
  The 'solution' was to change the id type to objectid and keep primaryKey as true.  Waterline then mapped the id correctly...but Waterline is supposed to be db 
  agnostic so I wonder if my models would work on a different db.
  
  After trying to add an idea associated with a user and getting
  Invalid attributes sent to User:
   • id
     • [object Object]
     when saving
  
  The new 'solution' was to remove the definition for id in both models.  Then everything worked.
 
## Using request.user object ##
I thought one had to search using the User model to create a user object we could add an object to a collection and save.  It turns out we can just use the request.user object directly.
Here's the previous code:
```
                User.findOne( { id : req.user.id })
                    .then( (user) => {
                        if (! user) { return res.notFound( "User Not Found"); }
                        Idea.create({ title: title || '', detail: detail || ''})
                            .then( (idea) => {
                                user.ideas.add(idea);
                                user.save()
                                    .then ( () => res.json(idea) )
                                    .catch( (err) => { res.serverError(err) });
                            })
                            .catch( (err) => res.serverError(err));
                      })
                    .catch((err) => { res.serverError(err) });
```
Here's the new code:
```
            Idea.create({ title: title || '', detail: detail || ''})
                .then( (idea) => {
                    req.user.ideas.add(idea);
                    req.user.save()
                        .then ( () => res.json(idea) )
                        .catch( (err) => { res.serverError(err) });
                })
                .catch( (err) => res.serverError(err));
```
## Basic Notes ##
Pass data to views use the response.locals object
data from request:
  * GET query: request.query or request.params ?
  * POST: request.body
logged in user
  * request.user object.  If undefined, no user logged in

passport must have an underlying session manager to manage sessions (via cookies).  

```javascript
        Idea.find( {skip : (res.locals.paged-1) * res.locals.posts_per_page,
                    limit: res.locals.posts_per_page}).populate('userId')
```
This code was for pagination...now using built in .paginate

