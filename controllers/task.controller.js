const db = require("../models");
const Task = db.task;

// Create and Save a new Task
exports.create = (req, res) => {
  // Validate request
  if (!req.body.taskName) {
    res.status(400).send(
        { status : false , message:"Data to be added cannot be empty!" , data: null }
      );
    return;
  }

  // Create a Task
  const task = new Task({
      taskName: req.body.taskName,
      recurringType: req.body.recurringType,
      scope: req.body.scope,
      points: req.body.points
  });

  // Save Task in the database
  task
    .save(task)
    .then(data => {
      res.send(
        { status : true , message:"New task added successfully!" , data: data }
      );
    })
    .catch(err => {
      res.status(500).send(
        { status : false , message: err.message , data: null }
      );
    });
};

// Retrieve all Tasks from the database.
exports.findAll = (req, res) => {

  Task.find({},{createdAt:0,updatedAt:0,__v:0})
    .then(data => {
      res.send(
        { status : true , message:"Existing tasks retrieved successfully!" , data: data }
      );
    })
    .catch(err => {
      res.status(500).send(
        { status : false , message: err.message , data: null }
      );
    });
};

// Find a single Task with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Task.find({"_id":id},{createdAt:0,updatedAt:0,__v:0})
    .then(data => {
      if(!data || !data.length){
        res.status(404).send({ status: false , message: "Task with id " + id +" does not exist!", data: null });
      }
      else {
        res.send(
            { status : true , message: "Task with id " + id + " retrieved successfully!" , data: data[0] }
        );
      }
    })
    .catch(err => {
      res
        .status(500)
        .send(
          { status : false , message: err.message , data: null }
        );
    });
};

// Update a Task by id in the request
exports.update = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send(
        { status : false , message:"Data to be updated cannot be empty!" , data: null }
      );
    return;
  }

  const id = req.params.id;

  let condition = {"_id":id};

  Task.findOneAndUpdate(condition, req.body, {new:true, useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          status: false,
          message: `Cannot update Task with id=${id}. Task does not exist!`,
          data: null
        });
      } 
      else{
        res.send({
          status: true, 
          message: "Task was updated successfully!",
          data: data 
        });
      } 
    })
    .catch(err => {
      res.status(500).send({
        status: false,
        message: err.message,
        data: null
      });
    });
};

