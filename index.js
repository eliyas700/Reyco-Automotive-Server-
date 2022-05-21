const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();

//Middle Ware
app.use(cors());
app.use(express.json());

//Mongodb Connect

app.get("/", (req, res) => {
  res.send("Hello World!This is from Reyco Automotive");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
