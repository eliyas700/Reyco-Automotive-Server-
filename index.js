const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
//Middle Ware
app.use(cors());
app.use(express.json());

//Mongodb Connect
const uri = `mongodb+srv://${process.env.MY_USER}:${process.env.MY_PASSWORD}@cluster0.wu2yr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
client.connect((err) => {
  const collection = client.db("test").collection("devices");
  console.log("mongo is connected");
  // perform actions on the collection object
  client.close();
});

app.get("/", (req, res) => {
  res.send("Hello World!This is from Reyco Automotive");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
