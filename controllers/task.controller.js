const db = require("../models");
const Task = db.task;
const Team = db.team;
const CTask = db.ctask;
const User = db.user;
const proj = "Project";
const weekly = "Weekly";
const monthly = "Monthly";
const daily = "Daily";
const mongoose = require('mongoose')


// Create and Save a new Task
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    res.status(400).send(
      { status: false, message: "Data to be added cannot be empty!", data: null }
    );
    return;
  }

  // Create a Task
  const task = new Task({
    title: req.body.title,
    description: req.body.description,
    frequency: req.body.frequency,
    scope: req.body.scope,
    points: req.body.points,
    status: req.body.status,
    duedate: req.body.duedate
  });

  // Save Task in the database
  task
    .save(task)
    .then(data => {
      res.send(
        { status: true, message: "New task added successfully!", data: data }
      );
    })
    .catch(err => {
      res.status(500).send(
        { status: false, message: err.message, data: null }
      );
    });
};

// Retrieve all Tasks from the database.
exports.findAll = (req, res) => {

  Task.find({}, { createdAt: 0, updatedAt: 0, __v: 0 })
    .then(data => {
      res.send(
        { status: true, message: "Existing tasks retrieved successfully!", data: data }
      );
    })
    .catch(err => {
      res.status(500).send(
        { status: false, message: err.message, data: null }
      );
    });
};


// Retrieve all Tasks by team from the database.
exports.findByTeam = (req, res) => {
  const team = req.params.team;

  //check if team exist
  checkTeamExist(team).then(function (result) {
    //if team exist continue on next query
    if (result) {
      Task.find({ $or: [{ "scope": proj }, { "scope": team }] }, { status: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        .then(data => {
          res.send(
            { status: true, message: team + " team existing tasks retrieved successfully!", data: data }
          );
        })
        .catch(err => {
          res.status(500).send(
            { status: false, message: err.message, data: null }
          );
        });
    }
    else {
      res.status(404).send({ status: false, message: "Team with name " + team + " does not exist!", data: null });
    }
  })
    .catch(function (message) {
      res.status(500).send(
        { status: false, message: message, data: null }
      )
    });

};

// Find a single Task with an id
exports.findOne = (req, res) => {
  const id = req.params.id;


  Task.find({ "_id": id }, { createdAt: 0, updatedAt: 0, __v: 0 })
    .then(data => {
      if (!data || !data.length) {
        res.status(404).send({ status: false, message: "Task with id " + id + " does not exist!", data: null });
      }
      else {
        res.send(
          { status: true, message: "Task with id " + id + " retrieved successfully!", data: data[0] }
        );
      }
    })
    .catch(err => {
      res
        .status(500)
        .send(
          { status: false, message: err.message, data: null }
        );
    });
};

// Update a Task by id in the request
exports.update = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send(
      { status: false, message: "Data to be updated cannot be empty!", data: null }
    );
    return;
  }

  const id = req.params.id;

  let condition = { "_id": id };

  Task.findOneAndUpdate(condition, req.body, { new: true, useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          status: false,
          message: `Cannot update Task with id=${id}. Task does not exist!`,
          data: null
        });
      }
      else {
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
// exports.completeTask = (req, res) => {
//   // Validate request
//   if (!req.body.task_id || !req.body.user_id) {
//     res.status(400).send(
//       { status: false, message: "No task id or user id provided!", data: null }
//     );
//     return;
//   }

//   //get current Date today
//   let datenow = new Date();
//   datenow.setHours(8, 0, 0, 0);
//   let id = req.params.id;
//   let taskid = req.body.task_id;

//   // Create a Complete Task
//   const ctask = new CTask({
//     task_id: req.body.task_id,
//     user_id: req.body.user_id,
//     recurringType: req.body.recurringType,
//     notes: req.body.notes,
//     complete_date: datenow
//   });

//   checkUser(id, "exist").then(function (result) {
//     //if user exist continue on next query
//     if (result) {
//       //check if task exist
//       checkTaskExist(taskid).then(function (result) {
//         if (result) {
//           // Save Complete Task in the database
//           ctask
//             .save(ctask)
//             .then(data => {
//               res.send(
//                 { status: true, message: "Task completed!", data: data }
//               );
//             })
//             .catch(err => {
//               res.status(500).send(
//                 { status: false, message: err.message, data: null }
//               );
//             });
//         }
//         else {
//           res.status(404).send({ status: false, message: "Task with id " + taskid + " does not exist!", data: null });
//         }
//       })
//         .catch(function (message) {
//           res.status(500).send(
//             { status: false, message: message, data: null }
//           )
//         });
//       ;
//     }
//     else {
//       res.status(404).send({ status: false, message: "User with id " + id + " does not exist!", data: null });
//     }
//   })
//     .catch(function (message) {
//       res.status(500).send(
//         { status: false, message: message, data: null }
//       )
//     });

// };




// exports.getMyTask = (req, res) => {

//   let id = req.params.id;
//   let mytasklist = [];
//   //get the team name of the user
//   checkUser(id, "team").then(teamname => {

//     //get daily task list
//     checkDailyTask(teamname, id, res)
//       .then(result => {
//         //if result is not empty, save list in variable
//         if (result.length != 0) {
//           mytasklist = result;
//         }

//         //get weekly list
//         checkWeeklyTask(teamname, id, mytasklist, res)
//           .then(result => {
//             //query for monthly task list is called inside checkWeeklyTask function

//           })
//           .catch(err => {
//             res.status(500).send(
//               { status: false, message: err.message, data: null }
//             )
//           });
//       })
//       .catch(err => {
//         res.status(500).send(
//           { status: false, message: err.message, data: null }
//         )
//       });

//   })
//     .catch(function (err) {
//       res.status(500).send(
//         { status: false, message: err.message, data: null }
//       )
//     });

// };


//custom functions exclusive to this controller**********************************

//check if the team name exist in Teams Collection
function getTeam(team) {

  return new Promise((resolve, reject) => {

    Team.find({ "name": team })
      .then(data => {
        if (!data || !data.length) {
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
async function checkTeamExist(team) {
  //wait for promise    
  let result = await (getTeam(team));
  //anything here is executed after result is resolved
  return result;
};

//check if user exist in database
function getUser(id, purpose) {

  return new Promise((resolve, reject) => {

    User.find({ "_id": id })
      .then(data => {
        if (!data || !data.length) {
          if (purpose === "exist") {
            resolve(false);
          }
          else if (purpose === "team") {
            resolve(data[0].team);
          }

        }
        else {
          if (purpose === "exist") {
            resolve(true);
          }
          else if (purpose === "team") {
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
async function checkUser(id, purpose) {
  //wait for promise    
  let result = await (getUser(id, purpose));
  //anything here is executed after result is resolved
  return result;
};

//check if task exist in database
function getTask(id) {

  return new Promise((resolve, reject) => {

    Task.find({ "_id": id })
      .then(data => {
        if (!data || !data.length) {
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
async function checkTaskExist(id) {
  //wait for promise    
  let result = await (getTask(id));
  //anything here is executed after result is resolved
  return result;
};

//get list of daily task in database
function getDailyTask(team) {

  return new Promise((resolve, reject) => {

    Task.find({ $and: [{ "recurringType": daily, $or: [{ "scope": proj }, { "scope": team }] }] }, { createdAt: 0, updatedAt: 0, __v: 0 })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log("getDailyTask function error:" + err.message);
        reject(err.message);
      });


  })
};

//async function for getting daily task
async function checkDailyTask(team, id, res) {
  //wait for promise    
  let result = await (getDailyTask(team));
  //anything here is executed after result is resolved
  //get completed daily task for specific user
  checkCDailyTask(id)
    .then(result2 => {

      result = getAvailableTask(result, result2);

    })
    .catch(err => {
      res.status(500).send(
        { status: false, message: err.message, data: null }
      )
    });
  return result;
};

//get list of specific user completed daily task in database
function getCDailyTask(userid) {

  return new Promise((resolve, reject) => {

    let datenow = new Date();
    datenow.setHours(31, 59, 59, 999);

    //get today's date on 12oc midnight
    let datenow12oc = new Date();
    datenow12oc.setHours(8, 0, 0, 0);

    CTask.find({
      $and: [{
        "user_id": userid,
        "recurringType": daily,
        "complete_date": {
          $gte: datenow12oc,
          $lte: datenow
        }
      }]
    })
      .then(data => {

        resolve(data);
      })
      .catch(err => {
        console.log("getCDailyTask function error:" + err.message);
        reject(err.message);
      });


  })
};

//async function to get completed daily task
async function checkCDailyTask(userid) {
  //wait for promise    
  let result = await (getCDailyTask(userid));
  //anything here is executed after result is resolved

  return result;
};

//get list of weekly task in database
function getWeeklyTask(team) {

  return new Promise((resolve, reject) => {

    Task.find({ $and: [{ "recurringType": weekly, $or: [{ "scope": proj }, { "scope": team }] }] }, { createdAt: 0, updatedAt: 0, __v: 0 })
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
async function checkWeeklyTask(team, id, mytasklist, res) {
  //wait for promise    
  let result = await (getWeeklyTask(team));
  //anything here is executed after result is resolved

  //get completed weekly task for specific user
  checkCWeeklyTask(id)
    .then(result2 => {

      result = getAvailableTask(result, result2);
      if (result.length != 0) {

        mytasklist = mytasklist.concat(result);

      }


      //get monthly list
      checkMonthlyTask(team, id, mytasklist, res)
        .then(result => {
          //additional query can be added here. checkMonthlyTask function is responsible for sending
          //the mytasklist as a response
        })
        .catch(err => {
          res.status(500).send(
            { status: false, message: err.message, data: null }
          )
        });

    })
    .catch(err => {
      res.status(500).send(
        { status: false, message: err.message, data: null }
      )
    });
  return result;
};

//get list of specific user completed weekly task in database
function getCWeeklyTask(userid) {

  return new Promise((resolve, reject) => {

    //get first day of week(sunday)
    let datenow = new Date();
    let dayofweek = new Date().getDay();
    let sunofweek = new Date();
    sunofweek.setDate(sunofweek.getDate() - dayofweek);
    sunofweek.setHours(8, 0, 0, 0);
    datenow.setHours(31, 59, 59, 999);

    CTask.find({
      $and: [{
        "user_id": userid,
        "recurringType": weekly,
        "complete_date": {
          $gte: sunofweek,
          $lte: datenow
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

//async function to get completed weekly tasks
async function checkCWeeklyTask(userid) {
  //wait for promise    
  let result = await (getCWeeklyTask(userid));
  //anything here is executed after result is resolved
  return result;
};

//get list of monthly task in database
function getMonthlyTask(team) {

  return new Promise((resolve, reject) => {

    Task.find({ $and: [{ "recurringType": monthly, $or: [{ "scope": proj }, { "scope": team }] }] }, { createdAt: 0, updatedAt: 0, __v: 0 })
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
async function checkMonthlyTask(team, id, mytasklist, res) {
  //wait for promise    
  let result = await (getMonthlyTask(team));

  //anything here is executed after result is resolved
  //get completed monthly task for specific user
  checkCMonthlyTask(id)
    .then(result2 => {

      result = getAvailableTask(result, result2);

      //append processed monthlylist to mytask and send as response
      if (result.length != 0) {

        mytasklist = mytasklist.concat(result);
      }

      //if mytasklist is not empty, send list normally else send message to inform that all tasks are completed
      if (mytasklist.length != 0) {
        res.send(
          {
            status: true,
            message: "Available tasks successfully retrieved!",
            data: mytasklist
          }
        );
      }
      else {
        res.send(
          {
            status: true,
            message: "No task available! User has completed all assigned tasks!",
            data: null
          }
        );
      }

    })
    .catch(err => {
      res.status(500).send(
        { status: false, message: err.message, data: null }
      )
    });
  return result;
};

//get list of specific user completed monthly task in database
function getCMonthlyTask(userid) {

  return new Promise((resolve, reject) => {

    let datenow = new Date();
    datenow.setHours(31, 59, 59, 999);

    //get first day of month
    let frstdyofmnth = new Date();
    frstdyofmnth.setDate(1);
    frstdyofmnth.setHours(8, 0, 0, 0);

    CTask.find({
      $and: [{
        "user_id": userid,
        "recurringType": monthly,
        "complete_date": {
          $gte: frstdyofmnth,
          $lte: datenow
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

//async function to get completed monthly tasks
async function checkCMonthlyTask(userid) {
  //wait for promise    
  let result = await (getCMonthlyTask(userid));
  //anything here is executed after result is resolved

  return result;
};

//function for processing available task. Completed task will be marked as completed.
//If the task complete date is not equal to today's date, it is removed from available
//task list of the user.
function getAvailableTask(tasklist, complist) {

  let taskcount = 0;
  //if complete task list is not empty
  if (complist.length != 0) {
    // go through the retrieved task list
    while (taskcount < tasklist.length) {

      let compcount = 0;
      //go through the retrieved completed task list
      while ((compcount < complist.length) && tasklist.length != 0) {

        //compare current task and completed task list and see if task is already completed
        if (tasklist[taskcount]._id.toString() === complist[compcount].task_id.toString()) {
          let datenow = new Date();
          datenow.setHours(8, 0, 0, 0);
          datenow = datenow.toString().substr(4, 11);
          let datecomp = complist[compcount].complete_date.toString().substr(4, 11);

          //if today's date is not equal to completed date, remove task from mytask list
          if (!(datenow === datecomp)) {

            tasklist.splice(taskcount, 1);
            //if the remove task is not from index 0, subtract counter by 1
            if (!(taskcount === 0)) {
              taskcount--;

              break;
            }

          }
          else {

            //if today's date is equal to completed date, status must be complete and break loop
            tasklist[taskcount].status = "Complete";
            taskcount++;

            break;
          }
          compcount++;
        }
        else {
          compcount++;
        }

        //if all completed tasks are search thoroughly, mark task as not completed
        if (compcount === complist.length) {

          //if task does not exist on completed task list, status must be not complete
          if (tasklist.length != 0) {
            tasklist[taskcount].status = "Not Complete";
            taskcount++;
            compcount++;
          }


        }


      }

    };
  }
  //if completed task list is empty
  else {
    if (tasklist.length != 0) {
      while (taskcount < tasklist.length) {
        tasklist[taskcount].status = "Not Complete";
        taskcount++;
      }
    }
  }

  return tasklist;
}


// *********************************************************** //

//get all task available to specific user

exports.getMyTask = async (req, res) => {

  try {
    const id = req.params.id;
    const user = await User.findOne({ '_id': id });
    const currentTasks = await Task.find({ scope: user.team, status: 'Active' });

    let lastYear = new Date();
    lastYear.setMonth(lastYear.getMonth() - 12);

    const completedTask = await CTask.find({ userid: mongoose.Types.ObjectId(id), completionDate: { $gte: lastYear } });

    let myTasks = [];

    currentTasks.forEach(element => {
      const index = completedTask.findIndex(obj => {
        return obj.taskid.equals(element._id);
      });

      if (index === -1) {
        myTasks.push({
          taskid: element._id.toString(),
          title: element.title,
          description: element.description,
          points: element.points,
          frequency: element.frequency,
          scope: element.scope,
          due: getDueDays(element.frequency, element.duedate),
          completed: false
        });
      }

    });

    myTasks.sort((a, b) => (a.due > b.due) ? 1 : ((b.due > a.due) ? -1 : 0));

    res.json({
      status: true,
      message: 'List of all current week tasks',
      data: myTasks
    });

  } catch (err) {

    res.json({
      status: false,
      message: err.message,
      data: []
    });

  }

}

function getDueDays(frequency, pDateRef) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayOfMonth = now.getDate();
  const daysInAMonth = getDaysInMonth(now.getMonth() + 1, now.getFullYear());

  let refDate = (pDateRef) ? new Date(pDateRef) : now;
  refDate.setDate(refDate.getDate() + 2);

  // console.log('pDateRef: ', pDateRef, ' | refDate: ', refDate, ' | now - refDate: ', Math.floor((refDate - now) / (1000 * 60 * 60 * 24)));
  // console.log('Month:', now.getMonth(), '| daysInAMonth: ', daysInAMonth, ' | dayOfMonth: ', dayOfMonth);
  let n = 1;

  if (frequency.trim() === 'One Time') {
    n = Math.floor((refDate - now) / (1000 * 60 * 60 * 24));
  } else if (frequency.trim() === 'Weekly') {
    n = 5 - dayOfWeek;
  } else if (frequency.trim() === 'Monthly') {
    n = daysInAMonth - dayOfMonth;
  }

  return n;
}
function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
};

exports.completeTask = (req, res) => {

  const completedTask = new CTask({
    taskid: mongoose.Types.ObjectId(req.body.taskid),
    userid: mongoose.Types.ObjectId(req.params.id),
    comments: req.body.comments,
    points: req.body.points,
    completionDate: Date.now()
  });

  completedTask.save()
    .then(data => {
      res.json({
        status: true,
        message: "Task completion successfully registered.",
        data: data
      });
    }).catch(err => {
      res.status(500).send(
        { status: false, message: err.message, data: null }
      );
    });

}

exports.getCompletedTask = (req, res) => {

  CTask.find({ 'userid': mongoose.Types.ObjectId(req.params.id) })
    .populate('taskid', `title description points`)
    .exec((err, data) => {

      if (err) {
        res.json({
          status: false,
          message: err.message,
          data: []
        });

        return;
      }

      res.json({
        status: true,
        message: 'Tasks successfully retrieved.',
        data: data
      });

    });

}


