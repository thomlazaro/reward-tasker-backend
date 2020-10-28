const db = require("../models");
const Task = db.task;
const Team = db.team;
const CTask = db.ctask;
const User = db.user;

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


// Retrieve all Tasks by team from the database.
exports.findByTeam = (req, res) => {
  const team = req.params.team;
  const proj = "Project";

  //check if team exist
  checkTeamExist(team).then(function(result) {
    //if team exist continue on next query
    if(result){
      Task.find({ $or: [ { "scope": proj}, { "scope": team } ] },{createdAt:0,updatedAt:0,__v:0})
      .then(data => {
        res.send(
          { status : true , message: team + " team existing tasks retrieved successfully!" , data: data }
        );
      })
      .catch(err => {
        res.status(500).send(
          { status : false , message: err.message , data: null }
        );
      });
    }
    else{
      res.status(404).send({ status: false , message: "Team with name " + team +" does not exist!", data: null });
    }
  })
  .catch(function(message){
    res.status(500).send(
      { status : false , message: message , data: null }
    )
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

// Complete task using task id
exports.completeTask = (req, res) => {
  // Validate request
  if (!req.body.task_id || !req.body.user_id) {
    res.status(400).send(
        { status : false , message:"No task id or user id provided!" , data: null }
      );
    return;
  }

  //get current Date today
  let datenow = new Date();
  let id = req.params.id;
  let taskid = req.body.task_id;

  // Create a Complete Task
  const ctask = new CTask({
        task_id: req.body.task_id,
        user_id: req.body.user_id,
        recurringType: req.body.recurringType,
        notes: req.body.notes,
        complete_date: datenow
  });

  checkUserExist(id).then(function(result) {
  //if user exist continue on next query
    if(result){
      //check if task exist
      checkTaskExist(taskid).then(function(result){
        if(result){
          // Save Complete Task in the database
          ctask
          .save(ctask)
          .then(data => {
            res.send(
              { status : true , message:"Task completed!" , data: data }
            );
          })
          .catch(err => {
            res.status(500).send(
              { status : false , message: err.message , data: null }
            );
          });
        }
        else{
          res.status(404).send({ status: false , message: "Task with id " + id +" does not exist!", data: null });
        }
      })
      .catch(function(message){
        res.status(500).send(
          { status : false , message: message , data: null }
        )
      });
      ;
    }
    else{
      res.status(404).send({ status: false , message: "User with id " + id +" does not exist!", data: null });
    }
  })
  .catch(function(message){
    res.status(500).send(
      { status : false , message: message , data: null }
    )
  });

};


//custom functions exclusive to this controller**********************************

//check if the team name exist in Teams Collection
function getTeam(team){
        
  return new Promise((resolve, reject) => {
     
    Team.find({"name":team})
    .then(data => {
      if(!data || !data.length){
        resolve(false);
      }
      else {
        resolve(true);
      }
    })
    .catch(err => {
      console.log("getTeam function error:" + err.message);
      reject(err.message);
    });
  })
};

//async function for checking Team name
async function checkTeamExist(team){
      //wait for promise    
      let result = await (getTeam(team));
      //anything here is executed after result is resolved
      return result;
};

//check if user exist in database
function getUser(id){
        
  return new Promise((resolve, reject) => {
     
    User.find({"_id":id})
    .then(data => {
      if(!data || !data.length){
        resolve(false);
      }
      else {
        resolve(true);

      }
    })
    .catch(err => {
      console.log("getUser function error:" + err.message);
      reject(err.message);
    });
  })
};

//async function for checking if user exist
async function checkUserExist(id){
      //wait for promise    
      let result = await (getUser(id));
      //anything here is executed after result is resolved
      return result;
};

//check if task exist in database
function getTask(id){
        
  return new Promise((resolve, reject) => {
     
    Task.find({"_id":id})
    .then(data => {
      if(!data || !data.length){
        resolve(false);
      }
      else {
        resolve(true);

      }
    })
    .catch(err => {
      console.log("getTask function error:" + err.message);
      reject(err.message);
    });
  })
};

//async function for checking if task exist
async function checkTaskExist(id){
      //wait for promise    
      let result = await (getTask(id));
      //anything here is executed after result is resolved
      return result;
};

