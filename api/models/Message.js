/**
* Message.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    body: {
      type: 'string', // データ型
      required: true  // 必須であることを表す
    },
    owner: {
      model: 'user',
      required: true
    }
  }
};

