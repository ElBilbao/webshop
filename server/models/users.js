let mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
let validator = require("validator");
const bcrypt = require("bcryptjs");

let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "A username is needed for this user"],
  },
  password: {
    type: String,
    minlength: 8,
    required: [true, "A password is required for this user"],
  },
  email: {
    type: String,
    required: [true, "An email is required for this user"],
    unique: true,
  },
  avatar: {
    data: Buffer, // An array
    contentType: String,
  },
});

userSchema.pre("save", function (next) {
  const user = this;

  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(10, function (saltError, salt) {
      if (saltError) {
        return next(saltError);
      } else {
        bcrypt.hash(user.password, salt, function (hashError, hash) {
          if (hashError) {
            return next(hashError);
          }

          user.password = hash;
          next();
        });
      }
    });
  } else {
    return next();
  }
});

module.exports = mongoose.model("User", userSchema);
