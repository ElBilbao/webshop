const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const app = express();

app.use(express.json()); // body-parser
app.use(cors());
app.use(cookieParser());

let productsRoutes = require("./server/routes/products.js");
let usersRoutes = require("./server/routes/users.js");
let cartRoutes = require("./server/routes/cart.js");

let database = require("./server/database");

let usersModel = require("./server/models/users");
let cartModel = require("./server/models/cart");

app.use("/products", productsRoutes);
app.use("/users", usersRoutes);
app.use("/cart", cartRoutes);

// ============= LOGIN
const secret = "MI*}FC:Q'QBO+e0w#X|*";

function generateToken(user) {
  let payload = {
    username: user.username,
    id: user.id,
  };
  let oneDay = 60 * 60 * 24;
  return (token = jwt.sign(payload, secret, { expiresIn: oneDay }));
}

function requireLogin(req, res, next) {
  let accessToken = req.cookies.authorization;
  // if there is no token stored in cookies, the request is unauthorized
  if (!accessToken) {
    console.log("LOGIN :: Unauthorized user, redirecting to login");
    return res.redirect("/login");
  }

  try {
    // use the jwt.verify method to verify the access token, itthrows an error if the token has expired or has a invalid signature
    payload = jwt.verify(accessToken, secret);
    console.log("LOGIN :: Logged user accessing the site " + payload.username);
    req.user = payload; // you can retrieve further details from the database. Here I am just taking the name to render it wherever it is needed.
    next();
  } catch (e) {
    //if an error occured return request unauthorized error, or redirect to login
    // return res.status(401).send():
    console.log(e);
    res.clearCookie("authorization");
    return res.redirect(403, "/login");
  }
}

app.get("/", requireLogin, async function (req, res) {
  let user = await usersModel.findOne({ _id: req.user.id });
  let stringValue;

  if (user) {
    stringValue =
      "data:image/jpg;base64," + user.avatar.data.toString("base64");
  }

  ejs.renderFile(
    "./server/pages/main/main.html",
    { user: req.user, avatar: stringValue },
    null,
    function (err, str) {
      if (err) {
        res.status(503).send("Error when rendering the view: \n" + err);
      } else {
        res.end(str);
      }
    }
  );
});

app.get("/register", function (req, res) {
  if (req.cookies.authorization) return res.redirect("/");
  res.sendFile("register.html", { root: "server/pages/main" });
});

app.get("/login", function (req, res) {
  if (req.cookies.authorization) return res.redirect("/");
  if (req.headers["host"].includes("localhost"))
    return res.redirect("http://127.0.0.1:3000/login");
  res.sendFile("login.html", { root: "server/pages/main" });
});

app.post("/login", async function (req, res) {
  const { username, password } = req.body;
  let user = await usersModel.findOne({ username: username });

  if (user) {
    bcrypt.compare(password, user.password, function (err, isMatch) {
      if (err) {
        res.status(500).send("Server error while verifying credentials");
      } else if (!isMatch) {
        res.status(403).send("Invalid credentials");
      } else {
        console.log("LOGIN :: Succesfully logged " + username + " in");
        // Generate an access token
        const accessToken = generateToken(user);
        res.cookie("authorization", accessToken, {
          secure: true,
          httpOnly: true,
        });
        console.log(accessToken);
        res.status(200).json(accessToken);
      }
    });
  } else {
    res.status(403).send("Invalid credentials");
  }
});

app.get("/:id/settings", (req, res) => {
  let userId = req.params.id;

  payload = jwt.verify(req.cookies.authorization, secret);

  if (userId != payload.id && payload.username != "admin") {
    res
      .status(401)
      .send(
        "<h1>ERROR 401: ACCESS DENIED</h1> <h3>You may only edit your own profile.</h3> "
      );
    return;
  }

  ejs.renderFile(
    "./server/pages/main/settings.html",
    { userId: userId },
    null,
    function (err, str) {
      if (err) res.status(503).send(`error when rendering the view: ${err}`);
      else {
        res.end(str);
      }
    }
  );
});

app.post("/logout", requireLogin, function (req, res) {
  console.log(`LOGIN :: Logging out ${req.username}`);
  res.clearCookie("authorization");
  res.redirect("/login");
});

app.post("/completePurchase", async (req, res) => {
  let user_id = req.body.userid;
  let cart = await cartModel.findOne({ userid: user_id });
  cart.cart = new Map();
  cart
    .save()
    .then(() => {
      console.log("PURCHASE :: " + user_id + " purchased his cart.");
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(error);
      res.status(503).end(`Could not purchase cart ${error}`);
    });
});

// ============= RUN SERVER
const portNumber = 3000;
var server = app.listen(portNumber, function () {
  console.log("SERVER :: Ready and running at 127.0.0.1:" + portNumber + ".");
  adminAccount();
  // cartExample();
});

// ============== HELPER FUNCTIONS

async function cartExample() {
  cart = new cartModel({
    userid: "123",
    cart: { init: 12, aja: 2 },
  });
  cart.save((err) => {
    if (err) res.status(503).send(`Error: ${err}`);
    else console.log("SERVER :: Cart created");
  });
}

async function adminAccount() {
  let user = await usersModel.findOne({ username: "admin" });
  if (!user) {
    user = new usersModel({
      username: "admin",
      password: "admin123",
      email: "admin@admin.com",
      avatar: {
        data: fs.readFileSync(path.join("./uploads/" + "avatar-default")),
        contentType: "image/jpg",
      },
    });
    user.save((err) => {
      if (err) res.status(503).send(`Error: ${err}`);
      else {
        let cart = new cartModel({
          userid: user._id,
          cart: {},
        });

        cart.save((err) => {
          if (err) res.status(503).send(`Error cart for admin: ${err}`);
        });
        console.log("SERVER :: Admin account created");
      }
    });
  }
}

function generateRandomString(length) {
  var result = [];
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(
      characters.charAt(Math.floor(Math.random() * charactersLength))
    );
  }
  return result.join("");
}

function generateRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
