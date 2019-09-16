var assertion = require('./app/Controllers/assertion');
//var badge = require('../app/Controllers/badge');
var landing = require('./app/Controllers/landing');

module.exports = function (app) {
 
  //Landing - for now landing on you rock badge
  app.get('/', landing.read); 

  //Badge Description Display
  //app.get('/badge/:badgeName', badge.read);

  //Badge Assertion Display
  app.get('/earned/:assertionId', assertion.read);

};