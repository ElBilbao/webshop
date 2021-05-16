const express = require("express");
const app = express();
app.use(express.json()); // body-parser
var cors = require("cors");
app.use(cors());

let productsRoutes = require("./server/routes/products.js");
let usersRoutes = require("./server/routes/users.js");

let database = require("./server/database");

const router = require("./server/routes/products.js");

app.use("/products", productsRoutes);
app.use("/users", usersRoutes);

app.route("/").get((req, res) => {
  res.send("WebShop v1");
  // let routerList = [];
  // productsRoutes.stack
  //   .filter((r) => r.route)
  //   .map((r) =>
  //     routerList.push(r.route.path + " " + JSON.stringify(r.route.methods))
  //   );

  // app._router.stack.forEach(function (r) {
  //   if (r.route && r.route.path) {
  //     console.log(r.route.path);
  //     routerList.push(r.route.path);
  //   }
  // });
  // let response = routerList.map((ele) => ele + "\n");
});

// ============= RUN SERVER
const portNumber = 3000;
var server = app.listen(portNumber, function () {
  console.log("SERVER :: Ready and running at PORT:" + portNumber + ".");
});

// ============== HELPER FUNCTIONS
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
