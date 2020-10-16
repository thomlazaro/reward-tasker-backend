const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.URI;
db.user = require("./user.model.js")(mongoose);
db.team = require("./team.model.js")(mongoose);
db.task = require("./task.model.js")(mongoose);

module.exports = db;