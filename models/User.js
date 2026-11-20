const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: String,
  name: { type: String, required: true, trim: true },
  role: {
    type: String,
    enum: ["admin", "kunde"],
    default:"kunde",
    required: true
  }
})

const user = mongoose.model("user", userSchema);

module.exports = user;
