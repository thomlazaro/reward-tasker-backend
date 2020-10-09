module.exports = app => {
  const cp = require("../controllers/cp.controller.js");

  var router = require("express").Router();

  // Change selected user password
  router.put("/", cp.changePass);

  app.use('/api/cp', router);
};