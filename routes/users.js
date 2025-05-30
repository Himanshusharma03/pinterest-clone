const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect(
  "mongodb+srv://himanshu:Himanshu0103@mongodb.x5em1ta.mongodb.net/?retryWrites=true&w=majority&appName=MongoDB"
);

const userSchema = mongoose.Schema({
  username: String,
  fullname: String,
  email: String,
  password: String,
  profileImage: String,
  boards: {
    type: Array,
    default: [],
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

userSchema.plugin(plm);

module.exports = mongoose.model("User", userSchema);
