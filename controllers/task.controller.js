const db = require("../models");
const Task = db.task;
const Team = db.team;
const CTask = db.ctask;
const User = db.user;
const proj = "Project";
const weekly = "Weekly";
const monthly = "Monthly";


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
      points: req.body.points,
      status: ""
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

  Task.find({},{status:0,createdAt:0,updatedAt:0,__v:0})
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

  //check if team exist
  checkTeamExist(team).then(function(result) {
    //if team exist continue on next query
    if(result){
      Task.find({ $or: [ { "scope": proj}, { "scope": team } ] },{status:0,createdAt:0,updatedAt:0,__v:0})
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


  Task.find({"_id":id},{status:0,createdAt:0,updatedAt:0,__v:0})
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

  checkUser(id,"exist").then(function(result) {
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
          res.status(404).send({ status: false , message: "Task with id " + taskid +" does not exist!", data: null });
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

//get all task available to specific user
exports.getMyTask = (req, res) => {

  let id = req.params.id;
  let monthlylist;
  let weeklylist;
  let mytasklist = [];

  //get the team name of the user
  checkUser(id,"team").then(teamname => {

        //get weekly task list
        checkWeeklyTask(teamname)
        .then(result => {
          //save list in variable
          weeklylist = result;
          
          //get completed weekly task for specific user
          checkCWeeklyTask(id)
            .then(result2 => {
              let weekcount = 0;
              
              // go through the retrieved weekly list
              while(weekcount < weeklylist.length) {
                
                let compcount = 0;
                //go through the retrived completed weekly list
                while (compcount < result2.length) {

                  //compare weekly and completed weekly list and see if task is already completed
                  if(weeklylist[weekcount]._id.toString() === result2[compcount].task_id.toString()){
                    let datenow = new Date().toString().substr(4,11);
                    let datecomp = result2[compcount].complete_date.toString().substr(4,11);

                    //if today's date is not equal to completed date, remove task from weekly list
                    if(!(datenow === datecomp)){

                      weeklylist.splice(weekcount,1);
                      if(!(weekcount === 0)){
                        weekcount--;
                      }
                      
                    }
                    else{

                      //if today's date is equal to completed date, status must be complete and break loop
                      weeklylist[weekcount].status = "Complete";
                      weekcount++;
                      break;
                    }
                    compcount++;
                  }
                  else{

                    //if task does not exist on completed task list, status must be not complete
                    weeklylist[weekcount].status = "Not Complete";
                    weekcount++;
                    compcount++;
                    
                  }
                  
                  
                }
                
              };
              //console.log(weeklylist);
              //append processed weeklylist and monthlylist and send as response
              mytasklist = mytasklist.concat(weeklylist);

            })
            .catch(message => {
              res.status(500).send(
                { status : false , message: message , data: null }
              )
            });
       
        })
        .catch(message => {
          res.status(500).send(
            { status : false , message: message , data: null }
          )
        });

        //get monthly list
        checkMonthlyTask(teamname)
        .then(result => {
          //save list in variable
        
          monthlylist = result;
          //get completed monthly task for specific user
          checkCMonthlyTask(id)
            .then(result2 => {
              
              let monthcount = 0;
              //go through monthly task list
              while(monthcount < monthlylist.length) {
          
                let compcount = 0;
                //go through completed monthly task list
                while (compcount < result2.length) {

                  //compare monthly list and completed monthly list and see if task was already completed
                  if(monthlylist[monthcount]._id.toString() === result2[compcount].task_id.toString()){
                    let datenow = new Date().toString().substr(4,11);

                    let datecomp = result2[compcount].complete_date.toString().substr(4,11);
                    
                    //if today's date is not equal to completed date, remove task from list
                    if(!(datenow === datecomp)){

                      monthlylist.splice(monthcount,1);
                      if(!(monthcount === 0)){
                        monthcount--;
                      }
                      
                      
                    }
                    else{
                      //if today's date is equal to completed date, status must be complete and break loop
                      monthlylist[monthcount].status = "Complete";
                      monthcount++;
                      break;
                    }
                    compcount++;
                  }
                  else{
                    //if task does not exist in completed list, status must be not complete
                    monthlylist[monthcount].status = "Not Complete";
                    monthcount++;
                    compcount++;
                    
                  }
                  
                  
                }
                
              };
              //append processed weeklylist and monthlylist and send as response
              mytasklist = mytasklist.concat(monthlylist);
              res.send({mytask:mytasklist});
            })
            .catch(message => {
              res.status(500).send(
                { status : false , message: message , data: null }
              )
            });
          
        })
        .catch(message => {
          res.status(500).send(
            { status : false , message: message , data: null }
          )
        });

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
function getUser(id,purpose){
        
  return new Promise((resolve, reject) => {
     
    User.find({"_id":id})
    .then(data => {
      if(!data || !data.length){
        if(purpose==="exist"){
          resolve(false);
        }
        else if(purpose==="team"){
          resolve(data[0].team);
        }
        
      }
      else {
        if(purpose==="exist"){
          resolve(true);
        }
        else if(purpose==="team"){
          resolve(data[0].team);
        }
        

      }
    })
    .catch(err => {
      console.log("getUser function error:" + err.message);
      reject(err.message);
    });
  })
};

//async function for checking if user exist
async function checkUser(id,purpose){
      //wait for promise    
      let result = await (getUser(id,purpose));
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

//get list of weekly task in database
function getWeeklyTask(team){
        
  return new Promise((resolve, reject) => {

      Task.find({  $and: [{ "recurringType": weekly, $or: [ { "scope": proj}, { "scope": team } ] }] },{createdAt:0,updatedAt:0,__v:0})
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log("getWeeklyTask function error:" + err.message);
        reject(err.message);
      });    
     

  })
};

//async function for getting weekly task
async function checkWeeklyTask(team){
      //wait for promise    
      let result = await (getWeeklyTask(team));
      //anything here is executed after result is resolved
      return result;
};

//get list of specific user completed weekly task in database
function getCWeeklyTask(userid){
        
  return new Promise((resolve, reject) => {

      //get first day of week(sunday)
      let datenow = new Date();
      let dayofweek = new Date().getDay();
      let sunofweek = new Date();
      sunofweek.setDate(sunofweek.getDate()-dayofweek); 
      sunofweek.setHours(8,0,0,0);


      CTask.find({  
        $and: [{
          "user_id": userid,
          "recurringType": weekly,
          "complete_date": {
            $gte: sunofweek,
            $lt: datenow
          }
        }] 
      })
      .then(data => {

        resolve(data);
      })
      .catch(err => {
        console.log("getCWeeklyTask function error:" + err.message);
        reject(err.message);
      });    
     

  })
};

//async function for checking if task exist
async function checkCWeeklyTask(userid){
      //wait for promise    
      let result = await (getCWeeklyTask(userid));
      //anything here is executed after result is resolved
      return result;
};

//get list of monthly task in database
function getMonthlyTask(team){
        
  return new Promise((resolve, reject) => {

      Task.find({  $and: [{ "recurringType": monthly, $or: [ { "scope": proj}, { "scope": team } ] }] },{createdAt:0,updatedAt:0,__v:0})
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log("getMonthlyTask function error:" + err.message);
        reject(err.message);
      });    
     

  })
};

//async function for getting monthly task
async function checkMonthlyTask(team){
      //wait for promise    
      let result = await (getMonthlyTask(team));
      //anything here is executed after result is resolved
      return result;
};

//get list of specific user completed monthly task in database
function getCMonthlyTask(userid){
        
  return new Promise((resolve, reject) => {

      let datenow = new Date();

      //get first day of month
      let frstdyofmnth = new Date();
      frstdyofmnth.setDate(1);
      frstdyofmnth.setHours(8,0,0,0);

      CTask.find({  
        $and: [{
          "user_id": userid,
          "recurringType": monthly,
          "complete_date": {
            $gte: frstdyofmnth,
            $lt: datenow
          }
        }] 
      })
      .then(data => {

        resolve(data);
      })
      .catch(err => {
        console.log("getCMonthlyTask function error:" + err.message);
        reject(err.message);
      });    
     

  })
};

//async function for checking if task exist
async function checkCMonthlyTask(userid){
      //wait for promise    
      let result = await (getCMonthlyTask(userid));
      //anything here is executed after result is resolved
      return result;
};