let mongoose = require("mongoose"); // Returns singleton object
mongoose.set("useCreateIndex", true);
const server = "localhost";
const database = "webshop";

class Database {
  constructor() {
    this._connect();
  }

  _connect() {
    mongoose
      .connect(`mongodb://${server}/${database}`, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      })
      .then(() => {
        console.log("DATABASE :: Connected successfully.");
      })
      .catch((err) => {
        console.error("DATABASE :: ERROR :: Connection unsuccessful.");
      });
  }
}

module.exports = new Database(); // Also returns a singleton object as we only need a single connection to the DB
