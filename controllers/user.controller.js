const db = require("../models");
const User = db.user;
const pass = "password";
const cf = require("../functions/custom-function.js");
// Create and Save a new User
exports.create = (req, res) => {
  // Validate request
  if (!req.body.id) {
    res.status(400).send(
        { status : false , message:"Data to be added cannot be empty!" , data: null }
      );
    return;
  }

  //create base64 string for default password
  let base64pass = cf.encodeToBase64(pass);

  // Create a User
  const user = new User({
    id: req.body.id,
    username: req.body.username,
    password: base64pass,
    fullname: req.body.fullname,
    team: req.body.team,
    role: req.body.role
  });

  // Save User in the database
  user
    .save(user)
    .then(data => {
      res.send(
        { status : true , message:"New user added successfully!" , data: data }
      );
    })
    .catch(err => {
      res.status(500).send(
        { status : false , message: err.message , data: null }
      );
    });
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {

  User.find({},{_id:0,password:0,createdAt:0,updatedAt:0,__v:0})
    .then(data => {
      res.send(
        { status : true , message:"Existing users retrieved successfully!" , data: data }
      );
    })
    .catch(err => {
      res.status(500).send(
        { status : false , message: err.message , data: null }
      );
    });
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.find({"id":id},{_id:0,password:0,createdAt:0,updatedAt:0,__v:0})
    .then(data => {
      if(!data || !data.length){
        res.status(404).send({ status: false , message: "User with id " + id +" does not exist!", data: null });
      }
      else {
        res.send(
            { status : true , message: "User with id " + id + " retrieved successfully!" , data: data[0] }
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

// Update a User by the id in the request
exports.update = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send(
        { status : false , message:"Data to be updated cannot be empty!" , data: null }
      );
    return;
  }

  const id = req.params.id;

  let condition = {"id":id};

  User.findOneAndUpdate(condition, req.body, {new:true, useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          status: false,
          message: `Cannot update User with id=${id}. User does not exist!`,
          data: null
        });
      } 
      else{
        res.send({
          status: true, 
          message: "User was updated successfully!",
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

// Delete a User with the specified id in the request
// exports.delete = (req, res) => {
//   const id = req.params.id;

//   User.findByIdAndRemove(id)
//     .then(data => {
//       if (!data) {
//         res.status(404).send({
//           message: `Cannot delete User with id=${id}. Maybe User was not found!`
//         });
//       } else {
//         res.send({
//           message: "User was deleted successfully!"
//         });
//       }
//     })
//     .catch(err => {
//       res.status(500).send({
//         message: "Could not delete User with id=" + id
//       });
//     });
// };

// Delete all Users from the database.
// exports.deleteAll = (req, res) => {
//   User.deleteMany({})
//     .then(data => {
//       res.send({
//         message: `${data.deletedCount} Users were deleted successfully!`
//       });
//     })
//     .catch(err => {
//       res.status(500).send({
//         message:
//           err.message || "Some error occurred while removing all users."
//       });
//     });
// };
