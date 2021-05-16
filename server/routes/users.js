var express = require("express");
var router = express.Router();
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

let usersModel = require("../models/users");

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

router.get("/create", (req, res) => {
  res.sendFile("insert.html", { root: "./server/pages/users/" });
});

router.post("/create", upload.single("avatar"), (req, res) => {
  let { username, password, email } = req.body; // JS object deconstruction

  avatarObject = {
    data: fs.readFileSync(path.join("./uploads/" + req.file.filename)),
    contentType: "image/jpg",
  };

  let users = new usersModel({
    username: username,
    password: password,
    email: email,
    avatar: avatarObject,
  });
  users.save((err) => {
    if (err) res.status(503).send(`Error: ${err}`);
    else res.send(users);
  });
});

router.get("/all", (req, res) => {
  res.sendFile("usersList.html", { root: "./server/pages/users/" });
});

router.get("/", async (req, res) => {
  let allusers = await usersModel.find();
  res.send(allusers);
});

router.get("/:id", async (req, res) => {
  let usersId = req.params.id;
  let users = await usersModel.findOne({ _id: usersId });
  if (users) res.send(users);
  else res.status(404).end(`User with id ${usersId} does not exist`);
});

router.put("/:id", (req, res) => {
  let usersId = req.params.id;
  let { username, password } = req.body;
  usersModel
    .findOneAndUpdate(
      { _id: usersId }, // selection criteria
      {
        username: username,
        password: password,
      }
    )
    .then((users) => res.send(users))
    .catch((err) => {
      console.log(error);
      res.status(503).end(`Could not update user ${error}`);
    });
});

router.delete("/:id", (req, res) => {
  let usersId = req.params.id;
  usersModel
    .findOneAndDelete({ _id: usersId })
    .then((users) => res.send(users))
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
