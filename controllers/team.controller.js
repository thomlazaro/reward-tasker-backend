const db = require("../models");
const Team = db.team;


// Get team list
exports.getTeam = (req, res) => {

  Team.find({},{_id:0})
    .then(data => {
      res.send(
        { status : true , message:"Team list retrieved successfully!" , data: data }
      );
    })
    .catch(err => {
      res.status(500).send(
        { status : false , message: err.message , data: null }
      );
    });
};



