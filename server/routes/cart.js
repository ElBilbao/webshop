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

router.delete("/:id", async (req, res) => {
  let user_id = req.params.id;
  let product = req.body.product;

  let cart = await cartModel.findOne({ userid: user_id });
  if (!cart) res.status(404).end("That user has no cart");
  let cart_content = cart.cart;
  console.log(req.body);
  let product_qty = cart.cart.get(product);

  if (!product_qty)
    res.status(403).end("That product was not found in the cart");
  product_qty--;
  if (product_qty == 0) {
    cart_content.delete(product);
  } else {
    cart_content.set(product, product_qty);
  }
  cart
    .save()
    .then((user) => res.sendStatus(200))
    .catch((err) => {
      console.log(err);
      res.status(503).end(`Could not update cart ${err}`);
    });
});

module.exports = router;
