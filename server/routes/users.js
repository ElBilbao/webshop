var express = require("express");
var router = express.Router();
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

let usersModel = require("../models/users");
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

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploads");
  },
  filename: (req, file, callback) => {
    callback(null, file.fieldname + "-" + Date.now());
  },
});
const upload = multer({ storage: storage });

router.get("/create", adminOnly, (req, res) => {
  res.sendFile("insert.html", { root: "./server/pages/users/" });
});

router.post("/create", upload.single("avatar"), (req, res) => {
  let { username, password, email } = req.body; // JS object deconstruction

  if (req.file) {
    avatarObject = {
      data: fs.readFileSync(path.join("./uploads/" + req.file.filename)),
      contentType: "image/jpg",
    };
  } else {
    avatarObject = {
      data: fs.readFileSync(path.join("./uploads/" + "avatar-default")),
      contentType: "image/jpg",
    };
  }

  let users = new usersModel({
    username: username,
    password: password,
    email: email,
    avatar: avatarObject,
  });
  users.save((err) => {
    if (err) res.status(503).send(`Error: ${err}`);
    else {
      let cart = new cartModel({
        userid: users._id,
        cart: {},
      });

      cart.save((err) => {
        if (err) res.status(503).send(`Error cart for new user: ${err}`);
      });

      res.send(users);
    }
  });
});

router.get("/all", adminOnly, (req, res) => {
  res.sendFile("usersList.html", { root: "./server/pages/users/" });
});

router.get("/", async (req, res) => {
  let allusers = await usersModel.find();

  let modifiedUsers = [];

  allusers.forEach((u) => {
    modifiedUsers.push({
      _id: u._id,
      username: u.username,
      email: u.email,
      password: u.password,
      avatar: {
        contentType: u.avatar.contentType,
        data: u.avatar.data.toString("base64"),
      },
    });
  });

  res.send(modifiedUsers);
});

router.get("/:id", async (req, res) => {
  let userId = req.params.id;
  let user = await usersModel.findOne({ _id: userId });
  if (user)
    res.send({
      _id: user._id,
      username: user.username,
      email: user.email,
      password: user.password,
      avatar: {
        contentType: user.avatar.contentType,
        data: user.avatar.data.toString("base64"),
      },
    });
  else res.status(404).end(`User with id ${userId} does not exist`);
});

router.put("/:id", upload.single("avatar"), async (req, res) => {
  let userId = req.params.id;
  let user = await usersModel.findOne({ _id: userId });
  user.username = req.body.username;
  user.email = req.body.email;
  user.password = req.body.password;

  if (req.file) {
    console.log("User modified the avatar");
    avatarObject = {
      data: fs.readFileSync(path.join("./uploads/" + req.file.filename)),
      contentType: "image/jpg",
    };
    user.avatar = avatarObject;
  } else {
    avatarObject = {
      data: fs.readFileSync(path.join("./uploads/" + "avatar-default")),
      contentType: "image/jpg",
    };
  }

  user
    .save()
    .then((user) => res.send(user))
    .catch((err) => {
      console.log(error);
      res.status(503).end(`Could not update user ${error}`);
    });
});

router.delete("/:id", (req, res) => {
  let usersId = req.params.id;
  usersModel
    .findOneAndDelete({ _id: usersId })
    .then((users) => {
      res.clearCookie("authorization");
      cartModel
        .findOneAndDelete({ userid: usersId })
        .then(() =>
          console.log("DATABASE :: Cart deleted as user was deleted.")
        )
        .catch((err) => {
          console.log(error);
          res.status(503).end(`Could not delete cart of user deleted ${error}`);
        });
      res.send(users);
    })
    .catch((err) => {
      console.log(error);
      res.status(503).end(`Could not delete user ${error}`);
    });
});

router.get("/:id/edit", (req, res) => {
  let userId = req.params.id;

  // load the users as string, leaver some markers and replace the markers with the info you need
  // create the page from scratch dynamically

  ejs.renderFile(
    "./server/pages/users/edit.html",
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

router.get("/insert/insertMany/", (req, res) => {
  for (i = 0; i < 10; i++) {
    let username = generateRandomString(10);
    let password = generateRandomInt(0, 10000);

    let users = new usersModel({
      username: username,
      password: password,
    });
    users.save((err) => {
      if (err) res.status(503).send(`error: ${err}`);
    });
  }
  res.send("done");
});

module.exports = router;
