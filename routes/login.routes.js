module.exports = app => {
  const cp = require("../controllers/login.controller.js");

  var router = require("express").Router();

  // Change selected user password
  router.post("/", cp.Login);

  app.use('/api/login', router);
};