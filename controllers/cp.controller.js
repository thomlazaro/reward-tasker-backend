const db = require("../models");
const User = db.user;
const cf = require("../functions/custom-function.js");
var newpass = "";

// Update a User password by id in the request
exports.changePass = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send(
        { status : false , message:"Data to be updated cannot be empty!" }
      );
    return;
  }

  let id = req.body.id;
  let userpass = cf.encodeToBase64(req.body.password);
  let newpass = cf.encodeToBase64(req.body.newpassword);

  //where id = id and password = userpass
  let condition = {"id":id,"password":userpass};

  //set password = newpass
  let pass = {
    password: newpass
  };

  //update users set password = new pass where id = id and password = userpass
  User.findOneAndUpdate(condition, pass, {useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          status: false,
          message: `Cannot update User password with id=${id}. Password does not match or the id does not exist!`
        });
      } 
      else{
        res.send({
          status: true, 
          message: "User password is updated successfully!"
        });
      } 
    })
    .catch(err => {
      res.status(500).send({
        status: false,
        message: err.message
      });
    });
};



