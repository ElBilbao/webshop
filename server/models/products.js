let mongoose = require("mongoose");
let validator = require("validator");
// https://www.npmjs.com/package/validator

let productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A title is needed for this product"],
  },
  price: {
    type: Number,
    min: 0,
    required: [true, "A price is required for this product"],
  },
  brand: String,
});

module.exports = mongoose.model("Product", productSchema);
