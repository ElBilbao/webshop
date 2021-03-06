var express = require("express");
var router = express.Router();
const ejs = require("ejs");
const jwt = require("jsonwebtoken");

let productsModel = require("../models/products");
let cartModel = require("../models/cart");

const secret = "MI*}FC:Q'QBO+e0w#X|*";

function adminOnly(req, res, next) {
  let accessToken = req.cookies.authorization;

  if (!accessToken) {
    console.log("LOGIN :: Unauthorized user, redirecting to login");
    return res.redirect("/login");
  }

  try {
    payload = jwt.verify(accessToken, secret);
    if (payload.username != "admin") {
      return res.redirect(401, "/login");
    }
    console.log("LOGIN :: Logged user accessing the site " + payload.username);
    req.user = payload;
    next();
  } catch (e) {
    console.log(e);
    return res.redirect(403, "/login");
  }
}

router.get("/create", adminOnly, (req, res) => {
  res.sendFile("insert.html", { root: "./server/pages/products/" });
});

router.post("/create", (req, res) => {
  let { name, price, brand } = req.body; // JS object deconstruction

  let products = new productsModel({
    name: name,
    price: price,
    brand: brand,
  });
  products.save((err) => {
    if (err) res.status(503).send(`Error: ${err}`);
    else res.send(products);
  });
});

router.get("/all", adminOnly, (req, res) => {
  res.sendFile("productsList.html", { root: "./server/pages/products/" });
});

router.get("/", async (req, res) => {
  let allproducts = await productsModel.find();
  res.send(allproducts);
});

router.get("/:id", async (req, res) => {
  let productsId = req.params.id;
  let products = await productsModel.findOne({ _id: productsId });
  if (products) res.send(products);
  else res.status(404).end(`Product with id ${productsId} does not exist`);
});

router.put("/:id", (req, res) => {
  let productsId = req.params.id;
  let { name, price, brand } = req.body;
  productsModel
    .findOneAndUpdate(
      { _id: productsId }, // selection criteria
      {
        name: name,
        price: price,
        brand: brand,
      }
    )
    .then((products) => res.send(products))
    .catch((err) => {
      console.log(error);
      res.status(503).end(`Could not update product ${error}`);
    });
});

router.delete("/:id", async (req, res) => {
  let productsId = req.params.id;

  let product = await productsModel.findOne({ _id: productsId });
  let product_name = product.name;

  let carts = await cartModel.find();

  for (let i = 0; i < carts.length; i++) {
    let cart_content = carts[i].cart;
    cart_content.delete(product_name);
    carts[i]
      .save()
      .then()
      .catch((err) => {
        console.log(err);
        res.status(503).end(`Could not update carts ${err}`);
      });
  }

  productsModel
    .findOneAndDelete({ _id: productsId })
    .then((products) => res.send(products))
    .catch((err) => {
      console.log(error);
      res.status(503).end(`Could not delete product ${error}`);
    });
});

router.get("/:id/edit", (req, res) => {
  let productId = req.params.id;

  ejs.renderFile(
    "./server/pages/products/edit.html",
    { productId: productId },
    null,
    function (err, str) {
      if (err) res.status(503).send(`error when rendering the view: ${err}`);
      else {
        res.end(str);
      }
    }
  );
});

router.get("/insert/insertMany/", (req, res) => {
  for (i = 0; i < 10; i++) {
    let name = generateRandomString(10);
    let price = generateRandomInt(0, 10000);
    let brand = generateRandomString(10);

    let products = new productsModel({
      name: name,
      price: price,
      brand: brand,
    });
    products.save((err) => {
      if (err) res.status(503).send(`error: ${err}`);
    });
  }
  res.send("done");
});

module.exports = router;
