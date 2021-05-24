var express = require("express");
var router = express.Router();

let cartModel = require("../models/cart");

router.get("/:id", async (req, res) => {
  let user_id = req.params.id;
  let user = await cartModel.findOne({ userid: user_id });
  if (user)
    res.send({
      _id: user._id,
      userid: user._id,
      cart: user.cart,
    });
  else res.status(404).end(`Cart for user id ${user_id} does not exist`);
});

router.post("/:id", async (req, res) => {
  let user_id = req.params.id;
  let cart = await cartModel.findOne({ userid: user_id });
  cart.cart = req.body.cart;
  console.log(req.body);
  cart
    .save()
    .then((user) => res.send(user))
    .catch((err) => {
      console.log(error);
      res.status(503).end(`Could not update cart ${error}`);
    });
});

module.exports = router;
