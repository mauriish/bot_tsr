const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    userId: { type: String, require: true, unique: true },
    serverId: { type: String, requiere: true },
    points: { type: Number, default: 0 }
});

const model = mongoose.model("tsrdb", profileSchema);

module.exports = model;