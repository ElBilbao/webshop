let mongoose = require("mongoose");
let validator = require("validator");
// https://www.npmjs.com/package/validator

let cartSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: [true, "A user is needed for this cart"],
  },
  cart: {
    type: Map,
    of: Number,
  },
});

module.exports = mongoose.model("Cart", cartSchema);
