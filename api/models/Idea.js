/**
 * Idea.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    id: {
      type: 'integer',
      unique: true,
      primaryKey: true
    },
    title: {
      type: 'string'
    },
    detail: {
      type: 'string'
    },
    userId: {
      model: 'user'
    }
  }
};

