var about = require('./app/Controllers/about');
var assertion = require('./app/Controllers/assertion');
var badge = require('./app/Controllers/badge');
var badges = require('./app/Controllers/badges');
var earnersMap = require('./app/Controllers/earnersMap');
var landing = require('./app/Controllers/landing');

module.exports = function (app) {
 
  //Landing - for now landing on you rock badge
  app.get('/', landing.read); 

  //About Page
  app.get('/about', about.read);

  //Badge Description Display
  app.get('/badge/:gistId', badge.read);

  //List of Badges
  app.get('/badges/', badges.read);

  //Badge Assertion Display
  app.get('/earned/:assertionId/:download?', assertion.read);

  //Badge Earners Map Display
  app.get('/earners-map/:badgeClassId', earnersMap.read);

};