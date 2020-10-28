module.exports = app => {
  const task = require("../controllers/task.controller.js");

  var router = require("express").Router();

  // Create a new Task
  router.post("/", task.create);

  // Retrieve all Tasks
  router.get("/", task.findAll);

  // Retrieve all task with team
  router.get("/team/:team", task.findByTeam);

  // Retrieve a single task with id
  router.get("/:id", task.findOne);

  // Update a task with id
  router.put("/:id", task.update);

  // Complete task assigned to user
  router.post("/complete/:id",task.completeTask);


  app.use('/api/task', router);
};