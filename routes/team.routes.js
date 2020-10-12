module.exports = app => {
  const team = require("../controllers/team.controller.js");

  var router = require("express").Router();

  // Get all teams 
  router.get("/", team.getTeam);

  app.use('/api/team', router);
};